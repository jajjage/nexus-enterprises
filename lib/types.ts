import type { OrderStatusValue } from "@/lib/order-status";

export type CheckoutInput = {
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  serviceSlug: string;
};

export type ServiceConfig = {
  slug: string;
  title: string;
  description: string;
  amountKobo: number;
};

export type OrderListRow = {
  id: string;
  orderNumber: string;
  clientName: string;
  serviceName: string;
  status: OrderStatusValue;
  createdAt: Date;
};

export type AdminUpdateInput = {
  orderId: string;
  status: OrderStatusValue;
  note: string;
};
