"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { broadcastPost } from "@/lib/newsletter";
import { generateSlug, estimateReadTime } from "@/lib/blog";

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1),
  coverImage: z.string().url().optional().nullable(),
  published: z.boolean(),
});

export async function createOrUpdatePostAction(data: unknown) {
  const parsed = postSchema.parse(data);
  const readTime = estimateReadTime(parsed.content);

  const post = await prisma.post.upsert({
    where: { id: parsed.id ?? "" },
    update: {
      title: parsed.title,
      slug: parsed.slug || generateSlug(parsed.title),
      excerpt: parsed.excerpt,
      content: parsed.content,
      coverImage: parsed.coverImage ?? null,
      published: parsed.published,
      readTime,
    },
    create: {
      title: parsed.title,
      slug: parsed.slug || generateSlug(parsed.title),
      excerpt: parsed.excerpt,
      content: parsed.content,
      coverImage: parsed.coverImage ?? null,
      published: parsed.published,
      readTime,
    },
  });

  return { id: post.id };
}

export async function deletePostAction(id: string) {
  await prisma.post.delete({ where: { id } });
}

export async function broadcastPostAction(id: string) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error("Post not found");
  return broadcastPost(post);
}
