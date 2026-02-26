import "server-only";

import { prisma } from "@/lib/prisma";
import { estimateReadTime, generateSlug } from "@/lib/blog-utils";

export async function listPublishedPosts(limit?: number) {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: limit,
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

export { estimateReadTime, generateSlug };
