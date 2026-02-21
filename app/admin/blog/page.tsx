import Link from "next/link";
import { PostTable } from "@/components/admin/post-table";
import { deletePostAction, broadcastPostAction } from "./actions";
import { prisma } from "@/lib/prisma";

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });

  async function handleDelete(id: string) {
    "use server";
    await deletePostAction(id);
  }

  async function handleBroadcast(id: string) {
    "use server";
    await broadcastPostAction(id);
  }

  return (
    <main className="section-space bg-slate-50">
      <div className="site-container space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--color-secondary)">Admin</p>
            <h1 className="text-3xl font-semibold text-(--color-primary)">Blog Posts</h1>
          </div>
          <Link
            href="/admin/blog/new"
            className="inline-flex h-10 items-center rounded-md bg-(--color-primary) px-4 text-sm font-semibold text-white"
          >
            Create New Post
          </Link>
        </div>

        <PostTable
          posts={posts.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            published: p.published,
            createdAt: p.createdAt.toISOString(),
          }))}
          onDelete={handleDelete}
          onBroadcast={handleBroadcast}
        />
      </div>
    </main>
  );
}
