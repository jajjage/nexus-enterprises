"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServiceBySlug } from "@/lib/services";
import {
  generatePaymentReference,
  PAYSTACK_PUBLIC_KEY,
} from "@/lib/paystack";

/**
 * Validate customer details before payment
 */
const customerSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Use a valid phone number"),
  companyName: z.string().trim().max(100).optional(),
  serviceSlug: z.string().trim().min(2),
});

export interface CheckoutResponse {
  success: boolean;
  paymentReference: string;
  amount: number;
  amountNaira: number;
  publicKey: string;
  email: string;
  metadata: {
    name: string;
    phone: string;
    companyName?: string;
    serviceSlug: string;
    serviceName: string;
  };
}

export interface OrderCreatedResponse {
  success: boolean;
  orderNumber: string;
  trackingToken: string;
  trackingUrl: string;
}

/**
 * Helper function: create order helper (shared between both flows)
 */
async function createOrderRecord(
  name: string,
  email: string,
  phone: string,
  companyName: string | undefined,
  serviceSlug: string,
  amountKobo: number,
  paymentReference?: string
) {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  const dateSegment = `${now.getFullYear()}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  // Get service to fetch name
  const service = getServiceBySlug(serviceSlug);
  if (!service) {
    throw new Error("Unknown service selected");
  }

  // Get count of orders created today for order numbering
  const orderCountToday = await prisma.order.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  const orderNumber = `NEX-${dateSegment}-${String(
    orderCountToday + 1
  ).padStart(4, "0")}`;

  const trackingToken = crypto
    .randomUUID()
    .replace(/-/g, "");

  const order = await prisma.order.create({
    data: {
      orderNumber,
      trackingToken,
      serviceSlug,
      serviceName: service.title,
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      companyName,
      status: "AWAITING_PAYMENT",
      amountKobo,
      paymentProvider: "PAYSTACK",
      paymentReference: paymentReference || null,
      logs: {
        create: {
          status: "AWAITING_PAYMENT",
          note: paymentReference
            ? `Payment initiated. Waiting for confirmation.`
            : `Order placed. Awaiting payment.`,
        },
      },
    },
  });

  return order;
}

/**
 * Prepare checkout: validate customer and generate payment reference
 * This runs on server and returns data needed for Paystack payment
 */
export async function prepareCheckout(
  formData: FormData
): Promise<CheckoutResponse> {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    companyName: formData.get("companyName") || undefined,
    serviceSlug: formData.get("serviceSlug"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid form input");
  }

  const service = getServiceBySlug(parsed.data.serviceSlug);
  if (!service) {
    throw new Error("Unknown service selected");
  }

  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error(
      "Payment system is not configured. Please contact support."
    );
  }

  const paymentReference = generatePaymentReference();

  return {
    success: true,
    paymentReference,
    amount: service.amountKobo,
    amountNaira: service.amountKobo / 100,
    publicKey: PAYSTACK_PUBLIC_KEY,
    email: parsed.data.email,
    metadata: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      companyName: parsed.data.companyName,
      serviceSlug: parsed.data.serviceSlug,
      serviceName: service.title,
    },
  };
}

/**
 * Place order without payment
 * Creates order record with AWAITING_PAYMENT status
 * Returns tracking token for customer to track their order
 */
export async function placeOrder(
  formData: FormData
): Promise<OrderCreatedResponse> {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    companyName: formData.get("companyName") || undefined,
    serviceSlug: formData.get("serviceSlug"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid form input");
  }

  const service = getServiceBySlug(parsed.data.serviceSlug);
  if (!service) {
    throw new Error("Unknown service selected");
  }

  const order = await createOrderRecord(
    parsed.data.name,
    parsed.data.email,
    parsed.data.phone,
    parsed.data.companyName,
    parsed.data.serviceSlug,
    service.amountKobo
  );

  return {
    success: true,
    orderNumber: order.orderNumber,
    trackingToken: order.trackingToken,
    trackingUrl: `/track/${order.trackingToken}`,
  };
}
