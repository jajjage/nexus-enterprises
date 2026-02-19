import { PostEditor } from "@/components/admin/post-editor";
import type { PostSavePayload } from "@/components/admin/post-editor";
import { createOrUpdatePostAction } from "../actions";

export default function NewPostPage() {
  async function handleSave(payload: PostSavePayload) {
    "use server";
    return createOrUpdatePostAction(payload);
  }

  return (
    <main className="section-space bg-slate-50">
      <div className="site-container space-y-4">
        <h1 className="text-3xl font-semibold text-[var(--color-primary)]">New Post</h1>
        <PostEditor onSave={handleSave} />
      </div>
    </main>
  );
}
