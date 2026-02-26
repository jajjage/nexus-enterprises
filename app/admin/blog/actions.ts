"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { broadcastPost } from "@/lib/newsletter";
import { generateSlug, estimateReadTime } from "@/lib/blog-utils";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalTrimmedString = z.preprocess((value) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length ? normalized : null;
}, z.string().nullable());

const optionalUrlString = z.preprocess((value) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length ? normalized : null;
}, z.string().url().nullable());

const postSchema = z.object({
  id: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1, "Title is required."),
  slug: optionalTrimmedString,
  excerpt: optionalTrimmedString,
  content: z.string().trim().min(1, "Content is required."),
  coverImage: optionalUrlString,
  published: z.boolean(),
});

function htmlToPlainText(content: string) {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSlug(slug: string | null, title: string) {
  const fallback = generateSlug(title);
  const normalized = generateSlug(slug ?? fallback);
  if (!normalized || !slugPattern.test(normalized)) {
    throw new Error("Slug must be lowercase and URL-safe.");
  }
  return normalized;
}

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

function revalidatePostPaths(slug: string, previousSlug?: string) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }
}

export async function createOrUpdatePostAction(data: unknown) {
  await requireAdmin();
  const parsed = postSchema.parse(data);
  const plainText = htmlToPlainText(parsed.content);

  if (!plainText) {
    throw new Error("Content is required.");
  }

  const normalizedSlug = normalizeSlug(parsed.slug, parsed.title);
  const readTime = estimateReadTime(plainText);

  if (parsed.id) {
    const existing = await prisma.post.findUnique({
      where: { id: parsed.id },
      select: { id: true, slug: true },
    });

    if (!existing) {
      throw new Error("Post not found");
    }

    const slugConflict = await prisma.post.findFirst({
      where: {
        slug: normalizedSlug,
        NOT: { id: parsed.id },
      },
      select: { id: true },
    });

    if (slugConflict) {
      throw new Error("A post with this slug already exists.");
    }

    const post = await prisma.post.update({
      where: { id: parsed.id },
      data: {
        title: parsed.title,
        slug: normalizedSlug,
        excerpt: parsed.excerpt,
        content: parsed.content,
        coverImage: parsed.coverImage ?? null,
        published: parsed.published,
        readTime,
      },
      select: { id: true, slug: true },
    });

    revalidatePostPaths(post.slug, existing.slug);
    return { id: post.id };
  }

  const existingSlug = await prisma.post.findUnique({
    where: { slug: normalizedSlug },
    select: { id: true },
  });

  if (existingSlug) {
    throw new Error("A post with this slug already exists.");
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.title,
      slug: normalizedSlug,
      excerpt: parsed.excerpt,
      content: parsed.content,
      coverImage: parsed.coverImage ?? null,
      published: parsed.published,
      readTime,
    },
    select: { id: true, slug: true },
  });

  revalidatePostPaths(post.slug);
  return { id: post.id };
}

export async function deletePostAction(id: string) {
  await requireAdmin();

  const deleted = await prisma.post.delete({
    where: { id },
    select: { slug: true },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${deleted.slug}`);
}

export async function broadcastPostAction(id: string) {
  await requireAdmin();
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error("Post not found");
  return broadcastPost(post);
}
