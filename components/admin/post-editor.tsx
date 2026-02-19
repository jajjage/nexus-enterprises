"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { estimateReadTime, generateSlug } from "@/lib/blog";

export type PostEditorInitial = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  published?: boolean;
};

export type PostSavePayload = PostEditorInitial & { published: boolean };

type Props = {
  initial?: PostEditorInitial;
  onSave: (payload: PostSavePayload) => Promise<{ id: string }>;
  onUploadCover?: (file: File) => Promise<string>;
};

export function PostEditor({ initial, onSave, onUploadCover }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [coverImage, setCoverImage] = useState<string | undefined | null>(initial?.coverImage ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Placeholder.configure({ placeholder: "Write your post..." }),
      Link,
      Image,
    ],
    content: initial?.content ?? "",
  });

  useEffect(() => {
    if (!slug && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slug]);

  async function handleSave() {
    if (!editor) return;
    setError(null);
    const html = editor.getHTML();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    startTransition(async () => {
      const result = await onSave({
        id: initial?.id,
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        excerpt: excerpt || null,
        content: html,
        coverImage: coverImage ?? null,
        published,
      });
      router.replace(`/admin/blog/${result.id}`);
    });
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !onUploadCover) return;
    const url = await onUploadCover(file);
    setCoverImage(url);
  }

  const readTime = useMemo(() => estimateReadTime(editor?.getText() ?? ""), [editor]);

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => editor?.chain().focus().toggleBold().run()}>
            Bold
          </Button>
          <Button variant="outline" onClick={() => editor?.chain().focus().toggleItalic().run()}>
            Italic
          </Button>
          <Button variant="outline" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            Bullet List
          </Button>
          <Button variant="outline" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
            H2
          </Button>
        </div>
        <div className="mt-4 min-h-[360px] rounded-lg border border-slate-200 p-3">
          <EditorContent editor={editor} className="prose prose-sm max-w-none" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="text-sm font-semibold text-slate-700">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" className="mt-2" />
          <label className="mt-3 block text-sm font-semibold text-slate-700">Slug</label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-post" className="mt-2" />
          <label className="mt-3 block text-sm font-semibold text-slate-700">Excerpt</label>
          <Textarea value={excerpt ?? ""} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary" className="mt-2" />
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <input
              id="published"
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="published" className="cursor-pointer">Published</label>
            <span className="ml-auto text-xs text-slate-500">~{readTime} min read</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Cover Image</p>
            {coverImage ? <a href={coverImage} className="text-xs text-[var(--color-primary)]" target="_blank">View</a> : null}
          </div>
          <Input type="file" accept="image/*" className="mt-2" onChange={handleCoverUpload} />
          {coverImage ? <p className="mt-2 text-xs text-slate-500">Uploaded</p> : null}
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
