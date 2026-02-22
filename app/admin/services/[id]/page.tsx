import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceEditor } from "@/components/admin/service-editor";
import type { ServiceSavePayload } from "@/components/admin/service-editor";
import { archiveServiceAction, updateServiceAction } from "../actions";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    notFound();
  }

  async function handleSave(payload: ServiceSavePayload) {
    "use server";
    return updateServiceAction(payload);
  }

  async function handleArchive(serviceId: string) {
    "use server";
    return archiveServiceAction({ id: serviceId });
  }

  return (
    <main className="section-space bg-slate-50">
      <div className="site-container space-y-4">
        <h1 className="text-3xl font-semibold text-[var(--color-primary)]">Edit Service</h1>
        <ServiceEditor
          initial={{
            id: service.id,
            title: service.title,
            slug: service.slug,
            summary: service.summary,
            description: service.description,
            category: service.category,
            imageUrl: service.imageUrl,
            amountKobo: service.amountKobo,
            displayOrder: service.displayOrder,
            status: service.status,
          }}
          onSave={handleSave}
          onArchive={handleArchive}
        />
      </div>
    </main>
  );
}

