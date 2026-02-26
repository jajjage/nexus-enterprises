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
import { estimateReadTime, generateSlug } from "@/lib/blog-utils";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";

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
};

type UploadedFileLike = {
  url?: string | null;
  ufsUrl?: string | null;
  serverData?: {
    url?: string | null;
  } | null;
};

function extractUploadUrl(file?: UploadedFileLike | null) {
  if (!file) return null;
  return file.serverData?.url ?? file.ufsUrl ?? file.url ?? null;
}

function toPlainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Unable to save post right now.";
}

export function PostEditor({ initial, onSave }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [coverImage, setCoverImage] = useState<string | undefined | null>(initial?.coverImage ?? null);
  const [editorText, setEditorText] = useState(() => toPlainText(initial?.content ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Placeholder.configure({ placeholder: "Write your post..." }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: initial?.content ?? "",
    onUpdate({ editor: currentEditor }) {
      setEditorText(currentEditor.getText());
    },
  });

  useEffect(() => {
    if (!slug && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slug]);

  async function handleSave() {
    if (!editor) return;
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!editorText.trim()) {
      setError("Content is required.");
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const result = await onSave({
            id: initial?.id,
            title: title.trim(),
            slug: slug.trim() || generateSlug(title),
            excerpt: excerpt || null,
            content: editor.getHTML(),
            coverImage: coverImage ?? null,
            published,
          });
          router.replace(`/admin/blog/${result.id}`);
          router.refresh();
        } catch (saveError) {
          setError(getErrorMessage(saveError));
        }
      })();
    });
  }

  function handleSetLink() {
    if (!editor) return;

    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previous ?? "https://");

    if (url === null) return;

    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  }

  const readTime = useMemo(() => estimateReadTime(editorText), [editorText]);

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor}
          >
            Bold
          </Button>
          <Button
            variant="outline"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor}
          >
            Italic
          </Button>
          <Button
            variant="outline"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={!editor}
          >
            H2
          </Button>
          <Button
            variant="outline"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            disabled={!editor}
          >
            Bullet List
          </Button>
          <Button
            variant="outline"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            disabled={!editor}
          >
            Ordered List
          </Button>
          <Button variant="outline" onClick={handleSetLink} disabled={!editor}>
            {editor?.isActive("link") ? "Update Link" : "Add Link"}
          </Button>
          <Button
            variant="outline"
            onClick={() => editor?.chain().focus().unsetLink().run()}
            disabled={!editor?.isActive("link")}
          >
            Remove Link
          </Button>
          <UploadButton
            endpoint="editorImage"
            onClientUploadComplete={(files) => {
              const url = extractUploadUrl((files?.[0] ?? null) as UploadedFileLike | null);
              if (!url) {
                setError("Image upload finished, but no URL was returned.");
                return;
              }
              editor?.chain().focus().setImage({ src: url }).run();
            }}
            onUploadError={(uploadError: Error) => {
              setError(uploadError.message);
            }}
          />
        </div>
        <div className="mt-4 min-h-90 rounded-lg border border-slate-200 p-3">
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
            <label htmlFor="published" className="cursor-pointer">
              Published
            </label>
            <span className="ml-auto text-xs text-slate-500">~{readTime} min read</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Cover Image</p>
            {coverImage ? (
              <a
                href={coverImage}
                className="text-xs text-(--color-primary)"
                target="_blank"
                rel="noreferrer"
              >
                View
              </a>
            ) : null}
          </div>
          <div className="mt-3">
            <UploadDropzone
              endpoint="coverImage"
              onClientUploadComplete={(files) => {
                const url = extractUploadUrl((files?.[0] ?? null) as UploadedFileLike | null);
                if (!url) {
                  setError("Cover upload finished, but no URL was returned.");
                  return;
                }
                setCoverImage(url);
              }}
              onUploadError={(uploadError: Error) => {
                setError(uploadError.message);
              }}
            />
          </div>
          {coverImage ? (
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">Cover image uploaded.</p>
              <Button
                variant="ghost"
                className="h-8 px-2 text-xs text-rose-600"
                onClick={() => setCoverImage(null)}
              >
                Remove
              </Button>
            </div>
          ) : null}
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button onClick={handleSave} disabled={saving || !editor} className="w-full">
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
