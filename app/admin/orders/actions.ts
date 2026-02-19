"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AdminUpdateInput } from "@/lib/types";
import { prisma } from "@/lib/prisma";

const updateOrderSchema = z.object({
  orderId: z.string().trim().min(1),
  status: z.enum([
    "PAYMENT_PENDING",
    "PAYMENT_CONFIRMED",
    "IN_PROGRESS",
    "ACTION_REQUIRED",
    "COMPLETED",
    "CANCELLED",
  ]),
  note: z.string().trim().min(3, "Please include a meaningful update note."),
});

export async function updateOrderAction(input: AdminUpdateInput): Promise<{ ok: true }> {
  const parsed = updateOrderSchema.parse(input);

  await prisma.$transaction([
    prisma.order.update({
      where: { id: parsed.orderId },
      data: { status: parsed.status },
    }),
    prisma.orderLog.create({
      data: {
        orderId: parsed.orderId,
        status: parsed.status,
        note: parsed.note,
      },
    }),
  ]);

  console.log("Sending Email/WhatsApp notification to client...", {
    orderId: parsed.orderId,
    status: parsed.status,
  });

  revalidatePath("/admin/orders");

  return { ok: true };
}

export async function getOrdersForAdmin() {
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
