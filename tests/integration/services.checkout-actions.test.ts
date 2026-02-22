import { ServiceStatus } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../../lib/prisma";
import {
  cleanupByPrefixes,
  createServiceFixture,
  createSuitePrefix,
  prefixedEmail,
} from "../setup/db-utils";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { createOrderAction } from "@/app/services/[service-slug]/actions";
import { placeOrder, prepareCheckout } from "@/app/services/[service-slug]/checkout-action";

describe.sequential("service checkout actions", () => {
  const prefix = createSuitePrefix("checkout-actions");
  let publishedSlug = "";
  let draftSlug = "";

  beforeAll(async () => {
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "pk_test_checkout";

    const publishedService = await createServiceFixture({
      slug: `${prefix}-published`,
      title: "Checkout Published Service",
      amountKobo: 600000,
      status: ServiceStatus.PUBLISHED,
    });

    const draftService = await createServiceFixture({
      slug: `${prefix}-draft`,
      title: "Checkout Draft Service",
      amountKobo: null,
      status: ServiceStatus.DRAFT,
    });

    publishedSlug = publishedService.slug;
    draftSlug = draftService.slug;
  });

  beforeEach(() => {
    mocks.redirect.mockClear();
  });

  afterAll(async () => {
    await cleanupByPrefixes([prefix]);
  });

  function buildFormData(slug: string, overrides?: Partial<Record<string, string>>) {
    const formData = new FormData();
    formData.append("name", overrides?.name ?? "Checkout User");
    formData.append("email", overrides?.email ?? prefixedEmail(prefix));
    formData.append("phone", overrides?.phone ?? "+2348011111111");
    formData.append("companyName", overrides?.companyName ?? `${prefix}-company`);
    formData.append("serviceSlug", overrides?.serviceSlug ?? slug);
    return formData;
  }

  it("prepareCheckout succeeds for published priced service", async () => {
    const result = await prepareCheckout(buildFormData(publishedSlug));

    expect(result.success).toBe(true);
    expect(result.amount).toBe(600000);
    expect(result.metadata.serviceSlug).toBe(publishedSlug);
  });

  it("prepareCheckout rejects draft service", async () => {
    await expect(prepareCheckout(buildFormData(draftSlug))).rejects.toThrow("Unknown service selected");
  });

  it("prepareCheckout rejects missing or invalid form fields", async () => {
    await expect(
      prepareCheckout(
        buildFormData(publishedSlug, {
          email: "not-an-email",
        }),
      ),
    ).rejects.toThrow("Invalid email address");
  });

  it("placeOrder creates order with service relation, snapshots, and awaiting status", async () => {
    const email = `${prefix}-place-order@example.test`;
    const result = await placeOrder(buildFormData(publishedSlug, { email }));

    expect(result.success).toBe(true);
    expect(result.trackingToken.length).toBeGreaterThan(10);

    const order = await prisma.order.findUnique({
      where: { trackingToken: result.trackingToken },
      include: { logs: true },
    });

    expect(order).toBeTruthy();
    expect(order?.status).toBe("AWAITING_PAYMENT");
    expect(order?.serviceSlug).toBe(publishedSlug);
    expect(order?.serviceId).toBeTruthy();
    expect(order?.serviceName).toBe("Checkout Published Service");
    expect(order?.amountKobo).toBe(600000);
    expect(order?.logs.length).toBeGreaterThan(0);
  });

  it("placeOrder writes an OrderLog entry", async () => {
    const email = `${prefix}-log-check@example.test`;
    const result = await placeOrder(buildFormData(publishedSlug, { email }));

    const order = await prisma.order.findUnique({
      where: { trackingToken: result.trackingToken },
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    expect(order?.logs[0]?.status).toBe("AWAITING_PAYMENT");
    expect(order?.logs[0]?.note).toContain("Awaiting payment");
  });

  it("createOrderAction redirects to tracking page with token", async () => {
    const formData = buildFormData(publishedSlug, {
      email: `${prefix}-redirect@example.test`,
    });

    await expect(createOrderAction(formData)).rejects.toThrow(/NEXT_REDIRECT:\/track\//);
    expect(mocks.redirect).toHaveBeenCalledWith(expect.stringMatching(/^\/track\/[a-z0-9]+$/));
  });

  it("unknown slug is rejected across checkout entrypoints", async () => {
    const formData = buildFormData("missing-service");

    await expect(prepareCheckout(formData)).rejects.toThrow("Unknown service selected");
    await expect(placeOrder(formData)).rejects.toThrow("Unknown service selected");
    await expect(createOrderAction(formData)).rejects.toThrow("Unknown service selected");
  });
});
