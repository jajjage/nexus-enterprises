export const ORDER_STATUS_OPTIONS = [
  "AWAITING_PAYMENT",
  "PAYMENT_CONFIRMED",
  "IN_PROGRESS",
  "ACTION_REQUIRED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUS_OPTIONS)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  AWAITING_PAYMENT: "Awaiting Payment",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  IN_PROGRESS: "In Progress",
  ACTION_REQUIRED: "Action Required",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatusValue, string> = {
  AWAITING_PAYMENT: "bg-yellow-100 text-yellow-800",
  PAYMENT_CONFIRMED: "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  ACTION_REQUIRED: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};
