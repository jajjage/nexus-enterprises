import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/post-editor";
import type { PostSavePayload } from "@/components/admin/post-editor";
import { createOrUpdatePostAction } from "../actions";
import { prisma } from "@/lib/prisma";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  async function handleSave(payload: PostSavePayload) {
    "use server";
    return createOrUpdatePostAction(payload);
  }

  return (
    <main className="section-space bg-slate-50">
      <div className="site-container space-y-4">
        <h1 className="text-3xl font-semibold text-[var(--color-primary)]">Edit Post</h1>
        <PostEditor
          initial={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage,
            published: post.published,
          }}
          onSave={handleSave}
        />
      </div>
    </main>
  );
}
