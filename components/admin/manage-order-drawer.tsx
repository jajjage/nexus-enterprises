"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderAction } from "@/app/admin/orders/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  type OrderStatusValue,
} from "@/lib/order-status";
import { formatDateTime } from "@/lib/format";

type AdminOrderRow = {
  id: string;
  orderNumber: string;
  clientName: string;
  serviceName: string;
  status: OrderStatusValue;
  createdAt: string;
};

type ManageOrderDrawerProps = {
  orders: AdminOrderRow[];
};

export function ManageOrderDrawer({ orders }: ManageOrderDrawerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatusValue>("AWAITING_PAYMENT");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? null,
    [orders, selectedId],
  );

  function openDrawer(order: AdminOrderRow) {
    setSelectedId(order.id);
    setStatus(order.status);
    setNote("");
    setError("");
  }

  function closeDrawer() {
    setSelectedId(null);
    setError("");
    setNote("");
  }

  function onSave() {
    if (!selectedOrder) return;

    startTransition(async () => {
      try {
        await updateOrderAction({
          orderId: selectedOrder.id,
          status,
          note,
        });
        closeDrawer();
        router.refresh();
      } catch {
        setError("Unable to save update. Check your note and try again.");
      }
    });
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Client</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Service</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{order.orderNumber}</td>
                <td className="px-4 py-3 text-slate-700">{order.clientName}</td>
                <td className="px-4 py-3 text-slate-700">{order.serviceName}</td>
                <td className="px-4 py-3">
                  <Badge className={ORDER_STATUS_BADGE_CLASS[order.status]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDateTime(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <Button variant="outline" onClick={() => openDrawer(order)}>
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 lg:hidden">
        {orders.map((order) => (
          <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--color-primary)]">{order.orderNumber}</p>
                <p className="text-sm text-slate-600">{order.clientName}</p>
                <p className="text-sm text-slate-500">{order.serviceName}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
              </div>
              <Badge className={ORDER_STATUS_BADGE_CLASS[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>
            <Button className="mt-4 w-full" variant="outline" onClick={() => openDrawer(order)}>
              Manage Order
            </Button>
          </article>
        ))}
      </div>

      <div
        className={`fixed inset-0 z-[60] transition ${
          selectedOrder ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!selectedOrder}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            selectedOrder ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeDrawer}
        />

        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white p-6 shadow-2xl transition-transform ${
            selectedOrder ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Manage order"
        >
          {selectedOrder && (
            <>
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-primary)]">Manage Order</h2>
                  <p className="mt-1 text-sm text-slate-600">{selectedOrder.orderNumber}</p>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600"
                  onClick={closeDrawer}
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                  <Select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as OrderStatusValue)}
                  >
                    {ORDER_STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {ORDER_STATUS_LABELS[option]}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Update Note</label>
                  <Input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="CAC query regarding address"
                  />
                </div>

                {error ? <p className="text-sm text-rose-600">{error}</p> : null}

                <Button className="w-full" onClick={onSave} disabled={pending || note.trim().length < 3}>
                  {pending ? "Saving..." : "Save Update"}
                </Button>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
