import { ClipboardList } from "lucide-react";
import { ManageOrderDrawer } from "@/components/admin/manage-order-drawer";
import { getOrdersForAdmin } from "@/app/admin/orders/actions";
import type { OrderListRow } from "@/lib/types";

export default async function AdminOrdersPage() {
  const orders = await getOrdersForAdmin();

  return (
    <main className="section-space bg-slate-50">
      <div className="site-container">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
              Admin Dashboard
            </p>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold text-[var(--color-primary)]">
              <ClipboardList className="h-7 w-7" />
              Orders
            </h1>
          </div>
          <p className="text-sm text-slate-600">Sorted by newest first</p>
        </header>

        <ManageOrderDrawer
          orders={orders.map((order: OrderListRow) => ({
            ...order,
            createdAt: order.createdAt.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}
