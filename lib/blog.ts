import { prisma } from "@/lib/prisma";

export async function listPublishedPosts() {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findFirst({ where: { slug, published: true } });
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({ where: { id } });
}

export async function listAllPosts() {
  return prisma.post.findMany({ orderBy: { createdAt: "desc" } });
}

export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function estimateReadTime(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
