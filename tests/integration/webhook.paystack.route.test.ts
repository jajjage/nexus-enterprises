import { ServiceStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../../lib/prisma";
import {
  cleanupByPrefixes,
  createOrderFixture,
  createServiceFixture,
  createSuitePrefix,
  prefixedEmail,
} from "../setup/db-utils";

const mocks = vi.hoisted(() => ({
  validateWebhookSignature: vi.fn(),
  verifyPayment: vi.fn(),
  sendPaymentConfirmationEmail: vi.fn(),
}));

vi.mock("@/lib/paystack", () => ({
  validateWebhookSignature: mocks.validateWebhookSignature,
  verifyPayment: mocks.verifyPayment,
  WEBHOOK_EVENTS: {
    CHARGE_SUCCESS: "charge.success",
  },
}));

vi.mock("@/lib/email-templates", () => ({
  sendPaymentConfirmationEmail: mocks.sendPaymentConfirmationEmail,
}));

import { POST } from "@/app/api/webhooks/paystack/route";

describe.sequential("Paystack webhook route", () => {
  const prefix = createSuitePrefix("webhook");
  let serviceSlug = "";
  let serviceId = "";

  beforeAll(async () => {
    const service = await createServiceFixture({
      slug: `${prefix}-service`,
      title: "Webhook Test Service",
      amountKobo: 800000,
      status: ServiceStatus.PUBLISHED,
      displayOrder: 800,
    });

    serviceSlug = service.slug;
    serviceId = service.id;
  });

  beforeEach(() => {
    mocks.validateWebhookSignature.mockReset();
    mocks.verifyPayment.mockReset();
    mocks.sendPaymentConfirmationEmail.mockReset();

    mocks.validateWebhookSignature.mockReturnValue(true);
    mocks.verifyPayment.mockResolvedValue({
      status: true,
      data: {
        status: "success",
      },
    });
    mocks.sendPaymentConfirmationEmail.mockResolvedValue(undefined);
  });

  afterAll(async () => {
    await cleanupByPrefixes([prefix]);
  });

  type WebhookPayload = {
    event: string;
    data: {
      id: number;
      reference: string;
      amount: number;
      status: "success" | "failed";
      currency: string;
      customer: {
        id: number;
        email: string;
      };
      metadata: {
        name?: string;
        phone?: string;
        companyName?: string;
        serviceSlug?: string;
        orderNumber?: string;
      };
    };
  };

  function buildPayload(overrides?: Partial<WebhookPayload> & { data?: Partial<WebhookPayload["data"]> }): WebhookPayload {
    const basePayload: WebhookPayload = {
      event: "charge.success",
      data: {
        id: 1,
        reference: `${prefix}-reference-${Date.now()}`,
        amount: 800000,
        status: "success",
        currency: "NGN",
        customer: {
          id: 99,
          email: prefixedEmail(prefix),
        },
        metadata: {
          name: "Webhook User",
          phone: "+2348012222222",
          companyName: `${prefix}-company`,
          serviceSlug,
        },
      },
    };

    return {
      ...basePayload,
      ...overrides,
      data: {
        ...basePayload.data,
        ...(overrides?.data ?? {}),
      },
    };
  }

  function buildRequest(payload: unknown) {
    return new NextRequest("http://localhost/api/webhooks/paystack", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-paystack-signature": "test-signature",
      },
      body: JSON.stringify(payload),
    });
  }

  it("returns 401 for invalid signature", async () => {
    mocks.validateWebhookSignature.mockReturnValue(false);

    const response = await POST(buildRequest(buildPayload()));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Invalid signature" });
  });

  it("acknowledges non-charge.success events", async () => {
    const response = await POST(
      buildRequest(
        buildPayload({
          event: "charge.failed",
        }),
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
  });

  it("returns 400 for missing required metadata", async () => {
    const payload = buildPayload({
      data: {
        ...buildPayload().data,
        metadata: {},
      },
    });

    const response = await POST(buildRequest(payload));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Missing required metadata" });
  });

  it("returns 400 for unknown service slug", async () => {
    const payload = buildPayload({
      data: {
        ...buildPayload().data,
        metadata: {
          name: "Webhook User",
          phone: "+2348012222222",
          serviceSlug: `${prefix}-missing-service`,
        },
      },
    });

    const response = await POST(buildRequest(payload));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Unknown service" });
  });

  it("returns 400 for amount mismatch", async () => {
    const payload = buildPayload({
      data: {
        ...buildPayload().data,
        amount: 700000,
      },
    });

    const response = await POST(buildRequest(payload));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Amount mismatch" });
  });

  it("updates existing awaiting order to PAYMENT_CONFIRMED", async () => {
    const reference = `${prefix}-existing-reference`;
    const order = await createOrderFixture(prefix, {
      serviceId,
      serviceSlug,
      serviceName: "Webhook Test Service",
      amountKobo: 800000,
      paymentReference: reference,
    });

    const payload = buildPayload({
      data: {
        ...buildPayload().data,
        reference,
      },
    });

    const response = await POST(buildRequest(payload));

    expect(response.status).toBe(200);
    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: { logs: true },
    });

    expect(updated?.status).toBe("PAYMENT_CONFIRMED");
    expect(updated?.logs.some((log) => log.status === "PAYMENT_CONFIRMED")).toBe(true);
  });

  it("updates existing order on RETRY payment path", async () => {
    const order = await createOrderFixture(prefix, {
      serviceId,
      serviceSlug,
      serviceName: "Webhook Retry Service",
      amountKobo: 800000,
    });

    const reference = `RETRY-${order.orderNumber}-${Date.now()}`;
    const payload = buildPayload({
      data: {
        ...buildPayload().data,
        reference,
        metadata: {
          orderNumber: order.orderNumber,
        },
      },
    });

    const response = await POST(buildRequest(payload));

    expect(response.status).toBe(200);

    const updated = await prisma.order.findUnique({ where: { id: order.id } });
    expect(updated?.status).toBe("PAYMENT_CONFIRMED");
    expect(updated?.paymentReference).toBe(reference);
  });

  it("creates a new paid order for pay-now flow with service snapshots", async () => {
    const reference = `${prefix}-new-paid-${Date.now()}`;
    const email = `${prefix}-newpaid@example.test`;
    const payload = buildPayload({
      data: {
        ...buildPayload().data,
        reference,
        customer: {
          id: 10,
          email,
        },
      },
    });

    const response = await POST(buildRequest(payload));

    expect(response.status).toBe(200);

    const order = await prisma.order.findFirst({
      where: {
        paymentReference: reference,
      },
    });

    expect(order).toBeTruthy();
    expect(order?.serviceId).toBe(serviceId);
    expect(order?.serviceSlug).toBe(serviceSlug);
    expect(order?.serviceName).toBe("Webhook Test Service");
    expect(order?.status).toBe("PAYMENT_CONFIRMED");
  });

  it("does not fail webhook processing when email sending fails", async () => {
    mocks.sendPaymentConfirmationEmail.mockRejectedValueOnce(new Error("SMTP down"));

    const reference = `${prefix}-email-fail-${Date.now()}`;
    const order = await createOrderFixture(prefix, {
      serviceId,
      serviceSlug,
      serviceName: "Webhook Email Failure Service",
      amountKobo: 800000,
      paymentReference: reference,
    });

    const payload = buildPayload({
      data: {
        ...buildPayload().data,
        reference,
      },
    });

    const response = await POST(buildRequest(payload));

    expect(response.status).toBe(200);
    const updated = await prisma.order.findUnique({ where: { id: order.id } });
    expect(updated?.status).toBe("PAYMENT_CONFIRMED");
  });

  it("returns 400 when Paystack verification fails", async () => {
    mocks.verifyPayment.mockResolvedValueOnce({
      status: false,
      data: {
        status: "failed",
      },
    });

    const response = await POST(buildRequest(buildPayload()));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Payment verification failed" });
  });

  it("returns received:true contract on internal exceptions", async () => {
    mocks.verifyPayment.mockRejectedValueOnce(new Error("verification exploded"));

    const response = await POST(buildRequest(buildPayload()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      error: "Internal server error",
      received: true,
    });
  });
});
