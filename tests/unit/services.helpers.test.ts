import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    service: {
      findMany: prismaMocks.findMany,
      findFirst: prismaMocks.findFirst,
      findUnique: prismaMocks.findUnique,
    },
  },
}));

import {
  getCheckoutServiceBySlug,
  getPublishedServiceBySlug,
  getPublishedServices,
} from "@/lib/services";

const now = new Date("2026-02-22T00:00:00.000Z");

function serviceRow(overrides: Partial<{ slug: string; amountKobo: number | null; displayOrder: number }> = {}) {
  return {
    id: "svc_test",
    slug: overrides.slug ?? "service-test",
    title: "Service Test",
    summary: "Summary",
    description: "Description",
    category: "Category",
    imageUrl: "https://example.com/image.jpg",
    amountKobo: overrides.amountKobo ?? 300000,
    status: "PUBLISHED",
    displayOrder: overrides.displayOrder ?? 1,
    createdAt: now,
    updatedAt: now,
  };
}

describe("service helpers", () => {
  beforeEach(() => {
    prismaMocks.findMany.mockReset();
    prismaMocks.findFirst.mockReset();
    prismaMocks.findUnique.mockReset();
  });

  it("getPublishedServices filters to PUBLISHED and orders by displayOrder", async () => {
    prismaMocks.findMany.mockResolvedValue([
      serviceRow({ slug: "b", displayOrder: 1 }),
      serviceRow({ slug: "a", displayOrder: 2 }),
    ]);

    const result = await getPublishedServices();

    expect(prismaMocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PUBLISHED" },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
    );
    expect(result.map((item) => item.slug)).toEqual(["b", "a"]);
  });

  it("getCheckoutServiceBySlug returns null for non-positive price", async () => {
    prismaMocks.findFirst.mockResolvedValue(serviceRow({ amountKobo: 0 }));

    const result = await getCheckoutServiceBySlug("service-test");

    expect(result).toBeNull();
  });

  it("getCheckoutServiceBySlug returns null for unknown slug", async () => {
    prismaMocks.findFirst.mockResolvedValue(null);

    const result = await getCheckoutServiceBySlug("missing-service");

    expect(result).toBeNull();
  });

  it("getPublishedServiceBySlug returns null when service is missing", async () => {
    prismaMocks.findFirst.mockResolvedValue(null);

    const result = await getPublishedServiceBySlug("unknown");

    expect(result).toBeNull();
  });
});
