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

export type ServiceStatusValue = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ServiceCatalogItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  imageUrl: string;
  amountKobo: number | null;
  status: ServiceStatusValue;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ServiceFormInput = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  imageUrl: string;
  amountNaira?: number | null;
  displayOrder: number;
  status: ServiceStatusValue;
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

export type AdminRequestInput = {
  orderId: string;
  message: string;
};
