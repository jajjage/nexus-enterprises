import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  transaction: vi.fn(),
  orderUpdate: vi.fn(),
  orderFindUnique: vi.fn(),
  orderLogCreate: vi.fn(),
  findMany: vi.fn(),
  sendAdminOrderUpdateEmail: vi.fn(),
  sendAdminOrderRequestEmail: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    order: {
      findMany: mocks.findMany,
    },
  },
}));

vi.mock("@/lib/email-templates", () => ({
  sendAdminOrderUpdateEmail: mocks.sendAdminOrderUpdateEmail,
  sendAdminOrderRequestEmail: mocks.sendAdminOrderRequestEmail,
}));

import { getOrdersForAdmin, requestOrderInfoAction, updateOrderAction } from "@/app/admin/orders/actions";

describe("admin order actions", () => {
  beforeEach(() => {
    mocks.auth.mockReset();
    mocks.revalidatePath.mockReset();
    mocks.transaction.mockReset();
    mocks.orderUpdate.mockReset();
    mocks.orderFindUnique.mockReset();
    mocks.orderLogCreate.mockReset();
    mocks.findMany.mockReset();
    mocks.sendAdminOrderUpdateEmail.mockReset();
    mocks.sendAdminOrderRequestEmail.mockReset();

    mocks.auth.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    });

    mocks.transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        order: { update: mocks.orderUpdate, findUnique: mocks.orderFindUnique },
        orderLog: { create: mocks.orderLogCreate },
      }),
    );

    mocks.orderUpdate.mockResolvedValue({
      id: "order-1",
      orderNumber: "NEX-20260222-0001",
      trackingToken: "track-token",
      serviceName: "Business Registration",
      clientName: "Test User",
      clientEmail: "test@example.com",
    });

    mocks.orderLogCreate.mockResolvedValue({
      id: "log-1",
    });

    mocks.orderFindUnique.mockResolvedValue({
      id: "order-1",
      orderNumber: "NEX-20260222-0001",
      trackingToken: "track-token",
      serviceName: "Business Registration",
      clientName: "Test User",
      clientEmail: "test@example.com",
      status: "IN_PROGRESS",
    });

    mocks.sendAdminOrderUpdateEmail.mockResolvedValue({ sent: true });
    mocks.sendAdminOrderRequestEmail.mockResolvedValue({ sent: true });
  });

  it("rejects unauthorized update requests", async () => {
    mocks.auth.mockResolvedValueOnce(null);

    await expect(
      updateOrderAction({
        orderId: "order-1",
        status: "IN_PROGRESS",
        note: "Started processing documents",
      }),
    ).rejects.toThrow("Unauthorized");
  });

  it("saves update and sends notification email", async () => {
    const result = await updateOrderAction({
      orderId: "order-1",
      status: "IN_PROGRESS",
      note: "Started processing documents",
    });

    expect(result).toEqual({ ok: true });
    expect(mocks.orderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-1" },
        data: { status: "IN_PROGRESS" },
      }),
    );
    expect(mocks.orderLogCreate).toHaveBeenCalledWith({
      data: {
        orderId: "order-1",
        status: "IN_PROGRESS",
        note: "Started processing documents",
      },
    });
    expect(mocks.sendAdminOrderUpdateEmail).toHaveBeenCalledWith({
      customerName: "Test User",
      customerEmail: "test@example.com",
      orderNumber: "NEX-20260222-0001",
      serviceName: "Business Registration",
      status: "IN_PROGRESS",
      note: "Started processing documents",
      trackingToken: "track-token",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/orders");
  });

  it("does not fail update when email sending fails", async () => {
    mocks.sendAdminOrderUpdateEmail.mockRejectedValueOnce(new Error("SMTP down"));

    await expect(
      updateOrderAction({
        orderId: "order-1",
        status: "IN_PROGRESS",
        note: "Still processing the file.",
      }),
    ).resolves.toEqual({ ok: true });
  });

  it("rejects ACTION_REQUIRED as manual status transition", async () => {
    await expect(
      updateOrderAction({
        orderId: "order-1",
        status: "ACTION_REQUIRED",
        note: "Please upload your signed forms.",
      }),
    ).rejects.toThrow();
  });

  it("requestOrderInfoAction rejects unauthorized access", async () => {
    mocks.auth.mockResolvedValueOnce(null);

    await expect(
      requestOrderInfoAction({
        orderId: "order-1",
        message: "Please upload your signed forms.",
      }),
    ).rejects.toThrow("Unauthorized");
  });

  it("requestOrderInfoAction writes a log and sends request email without status change", async () => {
    const result = await requestOrderInfoAction({
      orderId: "order-1",
      message: "Please upload your signed forms.",
    });

    expect(result).toEqual({ ok: true });
    expect(mocks.orderFindUnique).toHaveBeenCalledWith({
      where: { id: "order-1" },
      select: expect.objectContaining({
        id: true,
        orderNumber: true,
        trackingToken: true,
        serviceName: true,
        clientName: true,
        clientEmail: true,
        status: true,
      }),
    });
    expect(mocks.orderLogCreate).toHaveBeenCalledWith({
      data: {
        orderId: "order-1",
        status: "IN_PROGRESS",
        note: "Additional information requested from client: Please upload your signed forms.",
      },
    });
    expect(mocks.sendAdminOrderRequestEmail).toHaveBeenCalledWith({
      customerName: "Test User",
      customerEmail: "test@example.com",
      orderNumber: "NEX-20260222-0001",
      serviceName: "Business Registration",
      currentStatus: "IN_PROGRESS",
      message: "Please upload your signed forms.",
      trackingToken: "track-token",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/orders");
  });

  it("requestOrderInfoAction still succeeds when email sending fails", async () => {
    mocks.sendAdminOrderRequestEmail.mockRejectedValueOnce(new Error("SMTP down"));

    await expect(
      requestOrderInfoAction({
        orderId: "order-1",
        message: "Please upload your updated ID card.",
      }),
    ).resolves.toEqual({ ok: true });
  });

  it("getOrdersForAdmin rejects unauthorized access", async () => {
    mocks.auth.mockResolvedValueOnce(null);

    await expect(getOrdersForAdmin()).rejects.toThrow("Unauthorized");
  });

  it("getOrdersForAdmin returns newest-first list", async () => {
    mocks.findMany.mockResolvedValueOnce([{ id: "order-1" }]);

    const orders = await getOrdersForAdmin();

    expect(orders).toEqual([{ id: "order-1" }]);
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      }),
    );
  });
});
