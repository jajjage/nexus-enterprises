"use server";

import { ServiceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const amountNairaSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value === "string") return Number(value);
  return value;
}, z.number().positive("Price must be greater than zero.").nullable());

const serviceFormSchema = z.object({
  title: z.string().trim(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .refine((value) => slugPattern.test(value), {
      message: "Slug must be lowercase and URL-safe (letters, numbers, hyphens).",
    }),
  summary: z.string().trim(),
  description: z.string().trim(),
  category: z.string().trim(),
  imageUrl: z.string().trim(),
  amountNaira: amountNairaSchema,
  displayOrder: z.coerce.number().int().min(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

const createServiceSchema = serviceFormSchema;

const updateServiceSchema = serviceFormSchema.extend({
  id: z.string().trim().min(1),
});

const archiveServiceSchema = z.object({
  id: z.string().trim().min(1),
});

const setStatusSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

function toKobo(amountNaira: number | null): number | null {
  return amountNaira === null ? null : Math.round(amountNaira * 100);
}

function ensurePublishable(input: z.infer<typeof serviceFormSchema>) {
  if (!input.title) throw new Error("Title is required before publishing.");
  if (!input.summary) throw new Error("Summary is required before publishing.");
  if (!input.description) throw new Error("Description is required before publishing.");
  if (!input.category) throw new Error("Category is required before publishing.");
  if (!input.imageUrl) throw new Error("Image URL is required before publishing.");
  try {
    // Validate image URL format only when publishing.
    new URL(input.imageUrl);
  } catch {
    throw new Error("Image URL must be a valid URL before publishing.");
  }
  if (input.amountNaira === null || input.amountNaira <= 0) {
    throw new Error("Price (NGN) is required before publishing.");
  }
}

function revalidateServicePaths(slug: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
  revalidatePath(`/services/${slug}/checkout`);

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/services/${previousSlug}`);
    revalidatePath(`/services/${previousSlug}/checkout`);
  }
}

export async function listServicesAction() {
  return prisma.service.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function createServiceAction(input: unknown): Promise<{ id: string }> {
  const parsed = createServiceSchema.parse(input);

  if (parsed.status === "PUBLISHED") {
    ensurePublishable(parsed);
  }

  const existing = await prisma.service.findUnique({
    where: { slug: parsed.slug },
    select: { id: true },
  });

  if (existing) {
    throw new Error("A service with this slug already exists.");
  }

  const service = await prisma.service.create({
    data: {
      slug: parsed.slug,
      title: parsed.title,
      summary: parsed.summary,
      description: parsed.description,
      category: parsed.category,
      imageUrl: parsed.imageUrl,
      amountKobo: toKobo(parsed.amountNaira),
      displayOrder: parsed.displayOrder,
      status: parsed.status as ServiceStatus,
    },
    select: { id: true, slug: true },
  });

  revalidateServicePaths(service.slug);
  return { id: service.id };
}

export async function updateServiceAction(input: unknown): Promise<{ id: string }> {
  const parsed = updateServiceSchema.parse(input);

  const existing = await prisma.service.findUnique({
    where: { id: parsed.id },
    select: { id: true, slug: true, status: true },
  });

  if (!existing) {
    throw new Error("Service not found.");
  }

  if (existing.status === ServiceStatus.PUBLISHED && parsed.slug !== existing.slug) {
    throw new Error("Slug cannot be changed after publishing.");
  }

  if (parsed.status === "PUBLISHED") {
    ensurePublishable(parsed);
  }

  if (parsed.slug !== existing.slug) {
    const slugConflict = await prisma.service.findUnique({
      where: { slug: parsed.slug },
      select: { id: true },
    });
    if (slugConflict && slugConflict.id !== parsed.id) {
      throw new Error("A service with this slug already exists.");
    }
  }

  const updated = await prisma.service.update({
    where: { id: parsed.id },
    data: {
      slug: parsed.slug,
      title: parsed.title,
      summary: parsed.summary,
      description: parsed.description,
      category: parsed.category,
      imageUrl: parsed.imageUrl,
      amountKobo: toKobo(parsed.amountNaira),
      displayOrder: parsed.displayOrder,
      status: parsed.status as ServiceStatus,
    },
    select: { id: true, slug: true },
  });

  revalidateServicePaths(updated.slug, existing.slug);
  return { id: updated.id };
}

export async function archiveServiceAction(input: unknown): Promise<{ ok: true }> {
  const { id } = archiveServiceSchema.parse(input);

  const updated = await prisma.service.update({
    where: { id },
    data: { status: ServiceStatus.ARCHIVED },
    select: { slug: true },
  });

  revalidateServicePaths(updated.slug);
  return { ok: true };
}

export async function setServiceStatusAction(input: unknown): Promise<{ ok: true }> {
  const parsed = setStatusSchema.parse(input);

  const existing = await prisma.service.findUnique({
    where: { id: parsed.id },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      description: true,
      category: true,
      imageUrl: true,
      amountKobo: true,
      displayOrder: true,
      status: true,
    },
  });

  if (!existing) {
    throw new Error("Service not found.");
  }

  if (parsed.status === "PUBLISHED") {
    ensurePublishable({
      title: existing.title,
      slug: existing.slug,
      summary: existing.summary,
      description: existing.description,
      category: existing.category,
      imageUrl: existing.imageUrl,
      amountNaira:
        existing.amountKobo === null ? null : existing.amountKobo / 100,
      displayOrder: existing.displayOrder,
      status: "PUBLISHED",
    });
  }

  await prisma.service.update({
    where: { id: parsed.id },
    data: {
      status: parsed.status as ServiceStatus,
    },
  });

  revalidateServicePaths(existing.slug);
  return { ok: true };
}
