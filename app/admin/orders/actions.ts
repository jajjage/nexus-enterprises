"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { sendAdminOrderRequestEmail, sendAdminOrderUpdateEmail } from "@/lib/email-templates";
import type { AdminRequestInput, AdminUpdateInput } from "@/lib/types";
import { prisma } from "@/lib/prisma";

const updateOrderSchema = z.object({
  orderId: z.string().trim().min(1),
  status: z.enum([
    "AWAITING_PAYMENT",
    "PAYMENT_CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ]),
  note: z.string().trim().min(3, "Please include a meaningful update note."),
});

const requestOrderInfoSchema = z.object({
  orderId: z.string().trim().min(1),
  message: z.string().trim().min(3, "Please include a meaningful request message."),
});

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function updateOrderAction(input: AdminUpdateInput): Promise<{ ok: true }> {
  await requireAdmin();
  const parsed = updateOrderSchema.parse(input);

  const order = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: parsed.orderId },
      data: { status: parsed.status },
      select: {
        id: true,
        orderNumber: true,
        trackingToken: true,
        serviceName: true,
        clientName: true,
        clientEmail: true,
      },
    });

    await tx.orderLog.create({
      data: {
        orderId: parsed.orderId,
        status: parsed.status,
        note: parsed.note,
      },
    });

    return updatedOrder;
  });

  try {
    if (!order.clientEmail.trim()) {
      console.warn("Skipping admin update email: missing recipient", {
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    } else {
      const emailResult = await sendAdminOrderUpdateEmail({
        customerName: order.clientName,
        customerEmail: order.clientEmail,
        orderNumber: order.orderNumber,
        serviceName: order.serviceName,
        status: parsed.status,
        note: parsed.note,
        trackingToken: order.trackingToken,
      });

      if (!emailResult.sent) {
        console.error("Admin update email was not delivered", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          reason: emailResult.reason,
        });
      }
    }
  } catch (error) {
    console.error("Admin update email failed unexpectedly", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      error,
    });
  }

  revalidatePath("/admin/orders");

  return { ok: true };
}

export async function requestOrderInfoAction(input: AdminRequestInput): Promise<{ ok: true }> {
  await requireAdmin();
  const parsed = requestOrderInfoSchema.parse(input);

  const order = await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: parsed.orderId },
      select: {
        id: true,
        orderNumber: true,
        trackingToken: true,
        serviceName: true,
        clientName: true,
        clientEmail: true,
        status: true,
      },
    });

    if (!existingOrder) {
      throw new Error("Order not found");
    }

    await tx.orderLog.create({
      data: {
        orderId: parsed.orderId,
        status: existingOrder.status,
        note: `Additional information requested from client: ${parsed.message}`,
      },
    });

    return existingOrder;
  });

  try {
    if (!order.clientEmail.trim()) {
      console.warn("Skipping request info email: missing recipient", {
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    } else {
      const emailResult = await sendAdminOrderRequestEmail({
        customerName: order.clientName,
        customerEmail: order.clientEmail,
        orderNumber: order.orderNumber,
        serviceName: order.serviceName,
        currentStatus: order.status,
        message: parsed.message,
        trackingToken: order.trackingToken,
      });

      if (!emailResult.sent) {
        console.error("Request info email was not delivered", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          reason: emailResult.reason,
        });
      }
    }
  } catch (error) {
    console.error("Request info email failed unexpectedly", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      error,
    });
  }

  revalidatePath("/admin/orders");

  return { ok: true };
}

export async function getOrdersForAdmin() {
  await requireAdmin();
  return prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      orderNumber: true,
      clientName: true,
      serviceName: true,
      status: true,
      createdAt: true,
    },
  });
}
