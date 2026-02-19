export const ORDER_STATUS_OPTIONS = [
  "PAYMENT_PENDING",
  "PAYMENT_CONFIRMED",
  "IN_PROGRESS",
  "ACTION_REQUIRED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUS_OPTIONS)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  IN_PROGRESS: "In Progress",
  ACTION_REQUIRED: "Action Required",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatusValue, string> = {
  PAYMENT_PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PAYMENT_CONFIRMED: "bg-sky-50 text-sky-700 ring-sky-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-blue-200",
  ACTION_REQUIRED: "bg-orange-50 text-orange-700 ring-orange-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
};
