"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import type { ServiceStatusValue } from "@/lib/types";

export type AdminServiceRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  amountKobo: number | null;
  status: ServiceStatusValue;
  displayOrder: number;
  updatedAt: string;
};

type ServiceTableProps = {
  services: AdminServiceRow[];
  onArchive: (input: { id: string }) => Promise<{ ok: true }>;
  onSetStatus: (input: {
    id: string;
    status: ServiceStatusValue;
  }) => Promise<{ ok: true }>;
};

const STATUS_BADGE_CLASS: Record<ServiceStatusValue, string> = {
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ARCHIVED: "bg-amber-50 text-amber-700 ring-amber-200",
};

function formatNaira(amountKobo: number | null) {
  if (amountKobo === null) return "Not set";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amountKobo / 100);
}

export function ServiceTable({ services, onArchive, onSetStatus }: ServiceTableProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function archiveService(id: string) {
    setError("");
    const confirmed = window.confirm(
      "Archive this service? It will not show on the homepage, dropdowns, or checkout.",
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await onArchive({ id });
        router.refresh();
      } catch (archiveError) {
        setError(archiveError instanceof Error ? archiveError.message : "Unable to archive service.");
      }
    });
  }

  function setStatus(id: string, status: ServiceStatusValue) {
    setError("");
    startTransition(async () => {
      try {
        await onSetStatus({ id, status });
        router.refresh();
      } catch (statusError) {
        setError(statusError instanceof Error ? statusError.message : "Unable to update status.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Slug</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Order</TableHeaderCell>
              <TableHeaderCell>Updated</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-semibold text-[var(--color-primary)]">
                  {service.title}
                </TableCell>
                <TableCell className="font-mono text-xs">{service.slug}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{formatNaira(service.amountKobo)}</TableCell>
                <TableCell>
                  <Badge className={STATUS_BADGE_CLASS[service.status]}>{service.status}</Badge>
                </TableCell>
                <TableCell>{service.displayOrder}</TableCell>
                <TableCell className="text-sm text-slate-500">
                  {new Date(service.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/services/${service.id}`}
                    className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
                  >
                    Edit
                  </Link>

                  {service.status === "DRAFT" ? (
                    <button
                      className="text-sm font-semibold text-emerald-700"
                      onClick={() => setStatus(service.id, "PUBLISHED")}
                      disabled={pending}
                    >
                      Publish
                    </button>
                  ) : null}

                  {service.status === "PUBLISHED" ? (
                    <button
                      className="text-sm font-semibold text-slate-700"
                      onClick={() => setStatus(service.id, "DRAFT")}
                      disabled={pending}
                    >
                      Move to Draft
                    </button>
                  ) : null}

                  {service.status === "ARCHIVED" ? (
                    <button
                      className="text-sm font-semibold text-slate-700"
                      onClick={() => setStatus(service.id, "DRAFT")}
                      disabled={pending}
                    >
                      Restore Draft
                    </button>
                  ) : (
                    <button
                      className="text-sm font-semibold text-rose-600"
                      onClick={() => archiveService(service.id)}
                      disabled={pending}
                    >
                      Archive
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pending ? (
        <p className="text-sm text-slate-500">Updating service catalog...</p>
      ) : null}
      {!services.length ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
          No services found.
        </div>
      ) : null}
    </div>
  );
}
