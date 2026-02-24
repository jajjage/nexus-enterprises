"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCheckoutServiceBySlug } from "@/lib/services";
import {
  generatePaymentReference,
  PAYSTACK_PUBLIC_KEY,
} from "@/lib/paystack";
import { sendOrderPlacedAwaitingPaymentEmail } from "@/lib/email-templates";

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
  orderNumber: string;
  trackingToken: string;
  trackingUrl: string;
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
  service: {
    id: string;
    slug: string;
    title: string;
    amountKobo: number;
  },
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
      serviceId: service.id,
      serviceSlug: service.slug,
      serviceName: service.title,
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      companyName,
      status: "AWAITING_PAYMENT",
      amountKobo: service.amountKobo,
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

async function notifyOrderPlacedAwaitingPayment(order: {
  id: string;
  clientName: string;
  clientEmail: string;
  orderNumber: string;
  serviceName: string;
  amountKobo: number | null;
  trackingToken: string;
}) {
  try {
    const emailResult = await sendOrderPlacedAwaitingPaymentEmail({
      customerName: order.clientName,
      customerEmail: order.clientEmail,
      orderNumber: order.orderNumber,
      serviceName: order.serviceName,
      amount: (order.amountKobo ?? 0) / 100,
      trackingToken: order.trackingToken,
    });

    if (!emailResult.sent) {
      console.error("Order placed email was not delivered", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        reason: emailResult.reason,
      });
    }
  } catch (error) {
    console.error("Order placed email failed unexpectedly", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      error,
    });
  }
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

  const service = await getCheckoutServiceBySlug(parsed.data.serviceSlug);
  if (!service) {
    throw new Error("Unknown service selected");
  }

  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error(
      "Payment system is not configured. Please contact support."
    );
  }

  const paymentReference = generatePaymentReference();
  const order = await createOrderRecord(
    parsed.data.name,
    parsed.data.email,
    parsed.data.phone,
    parsed.data.companyName,
    service,
    paymentReference,
  );

  // Pay-now flow creates an awaiting order first so webhook can idempotently confirm it.
  // We still notify the customer in case they close payment and return later.
  await notifyOrderPlacedAwaitingPayment(order);

  return {
    success: true,
    paymentReference,
    orderNumber: order.orderNumber,
    trackingToken: order.trackingToken,
    trackingUrl: `/track/${order.trackingToken}`,
    amount: service.amountKobo,
    amountNaira: service.amountKobo / 100,
    publicKey: PAYSTACK_PUBLIC_KEY,
    email: parsed.data.email,
    metadata: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      companyName: parsed.data.companyName,
      serviceSlug: service.slug,
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

  const service = await getCheckoutServiceBySlug(parsed.data.serviceSlug);
  if (!service) {
    throw new Error("Unknown service selected");
  }

  const order = await createOrderRecord(
    parsed.data.name,
    parsed.data.email,
    parsed.data.phone,
    parsed.data.companyName,
    service
  );
  await notifyOrderPlacedAwaitingPayment(order);

  return {
    success: true,
    orderNumber: order.orderNumber,
    trackingToken: order.trackingToken,
    trackingUrl: `/track/${order.trackingToken}`,
  };
}
