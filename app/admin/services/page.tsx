import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { listServicesAction, archiveServiceAction, setServiceStatusAction } from "./actions";
import { ServiceTable } from "@/components/admin/service-table";
import type { ServiceStatusValue } from "@/lib/types";

export default async function AdminServicesPage() {
  const services = await listServicesAction();

  async function handleArchive(input: { id: string }) {
    "use server";
    return archiveServiceAction(input);
  }

  async function handleSetStatus(input: { id: string; status: ServiceStatusValue }) {
    "use server";
    return setServiceStatusAction(input);
  }

  return (
    <main className="section-space bg-slate-50">
      <div className="site-container space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--color-secondary)">
              Admin Dashboard
            </p>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold text-(--color-primary)">
              <BriefcaseBusiness className="h-7 w-7" />
              Services
            </h1>
          </div>
          <Link
            href="/admin/services/new"
            className="inline-flex h-10 items-center rounded-md bg-(--color-primary) px-4 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Create Service
          </Link>
        </header>

        <ServiceTable
          services={services.map((service) => ({
            id: service.id,
            title: service.title,
            slug: service.slug,
            category: service.category,
            amountKobo: service.amountKobo,
            status: service.status,
            displayOrder: service.displayOrder,
            updatedAt: service.updatedAt.toISOString(),
          }))}
          onArchive={handleArchive}
          onSetStatus={handleSetStatus}
        />
      </div>
    </main>
  );
}

