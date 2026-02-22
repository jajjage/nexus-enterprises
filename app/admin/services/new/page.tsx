import { ServiceEditor } from "@/components/admin/service-editor";
import type { ServiceSavePayload } from "@/components/admin/service-editor";
import { createServiceAction } from "../actions";

export default function NewServicePage() {
  async function handleSave(payload: ServiceSavePayload) {
    "use server";
    return createServiceAction(payload);
  }

  return (
    <main className="section-space bg-slate-50">
      <div className="site-container space-y-4">
        <h1 className="text-3xl font-semibold text-(--color-primary)">New Service</h1>
        <ServiceEditor onSave={handleSave} />
      </div>
    </main>
  );
}

