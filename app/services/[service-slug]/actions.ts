"use server";

// Legacy checkout entrypoint kept for compatibility.
// Active order creation flow is implemented in `checkout-action.ts`.

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCheckoutServiceBySlug } from "@/lib/services";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Use a valid phone number"),
  companyName: z.string().trim().max(100).optional(),
  serviceSlug: z.string().trim().min(2),
});

function createTrackingToken() {
  return crypto.randomUUID().replace(/-/g, "");
}

function formatDateSegment(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export async function createOrderAction(formData: FormData): Promise<never> {
  const parsed = checkoutSchema.safeParse({
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

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const dateSegment = formatDateSegment(now);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const orderCountToday = await prisma.order.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      const orderNumber = `NEX-${dateSegment}-${String(orderCountToday + 1 + attempt).padStart(4, "0")}`;
      const trackingToken = createTrackingToken();
      const order = await prisma.order.create({
        data: {
          orderNumber,
          trackingToken,
          serviceId: service.id,
          serviceSlug: service.slug,
          serviceName: service.title,
          clientName: parsed.data.name,
          clientEmail: parsed.data.email,
          clientPhone: parsed.data.phone,
          companyName: parsed.data.companyName,
          status: "AWAITING_PAYMENT",
          amountKobo: service.amountKobo,
          logs: {
            create: {
              status: "AWAITING_PAYMENT",
              note: "Order initiated",
            },
          },
        },
        select: {
          trackingToken: true,
        },
      });

      redirect(`/track/${order.trackingToken}`);
    } catch (error) {
      const uniqueConflict =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "P2002";

      if (!uniqueConflict || attempt === 4) {
        throw error;
      }
    }
  }

  throw new Error("Could not create order at this time.");
}
