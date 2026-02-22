"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ServiceStatusValue } from "@/lib/types";

export type ServiceEditorInitial = {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  amountKobo?: number | null;
  displayOrder?: number;
  status?: ServiceStatusValue;
};

export type ServiceSavePayload = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  imageUrl: string;
  amountNaira: number | null;
  displayOrder: number;
  status: ServiceStatusValue;
};

type ServiceEditorProps = {
  initial?: ServiceEditorInitial;
  onSave: (payload: ServiceSavePayload) => Promise<{ id: string }>;
  onArchive?: (id: string) => Promise<unknown>;
};

export function ServiceEditor({ initial, onSave, onArchive }: ServiceEditorProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [amountNaira, setAmountNaira] = useState(
    initial?.amountKobo ? String(initial.amountKobo / 100) : "",
  );
  const [displayOrder, setDisplayOrder] = useState(String(initial?.displayOrder ?? 0));
  const [status, setStatus] = useState<ServiceStatusValue>(initial?.status ?? "DRAFT");
  const slugLocked = useMemo(
    () => initial?.status === "PUBLISHED",
    [initial?.status],
  );

  function handleSave() {
    setError(null);

    startTransition(async () => {
      try {
        const payload: ServiceSavePayload = {
          id: initial?.id,
          title,
          slug,
          summary,
          description,
          category,
          imageUrl,
          amountNaira: amountNaira.trim() ? Number(amountNaira) : null,
          displayOrder: Number(displayOrder),
          status,
        };

        const result = await onSave(payload);
        router.replace(`/admin/services/${result.id}`);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Unable to save service.");
      }
    });
  }

  function handleArchive() {
    if (!initial?.id || !onArchive) return;
    setError(null);

    const confirmed = window.confirm(
      "Archive this service? It will be removed from public pages and checkout.",
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await onArchive(initial.id!);
        router.replace("/admin/services");
      } catch (archiveError) {
        setError(archiveError instanceof Error ? archiveError.message : "Unable to archive service.");
      }
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Business Name Registration" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Slug</label>
          <Input
            value={slug}
            onChange={(event) => setSlug(event.target.value.toLowerCase())}
            placeholder="business-name-registration"
            disabled={slugLocked}
          />
          {slugLocked ? (
            <p className="mt-1 text-xs text-slate-500">Slug is locked after publish.</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Summary</label>
          <Textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Short description used on homepage cards."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Detailed service information shown on the service page."
            className="min-h-32"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
            <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="CAC" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Image URL</label>
            <Input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Price (NGN)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amountNaira}
              onChange={(event) => setAmountNaira(event.target.value)}
              placeholder="6000"
            />
            <p className="mt-1 text-xs text-slate-500">Leave empty while in Draft.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Display Order</label>
            <Input
              type="number"
              min="0"
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
            <Select value={status} onChange={(event) => setStatus(event.target.value as ServiceStatusValue)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </div>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button onClick={handleSave} disabled={pending} className="w-full">
          {pending ? "Saving..." : "Save Service"}
        </Button>

        {initial?.id && onArchive ? (
          <Button
            variant="outline"
            onClick={handleArchive}
            disabled={pending || status === "ARCHIVED"}
            className="w-full border-rose-500 text-rose-600 hover:bg-rose-50"
          >
            Archive Service
          </Button>
        ) : null}
      </div>
    </div>
  );
}
