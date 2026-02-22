import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    service: {
      findUnique: mocks.findUnique,
      create: mocks.create,
      update: mocks.update,
    },
  },
}));

import { createServiceAction, updateServiceAction } from "@/app/admin/services/actions";

const validPayload = {
  title: "Business Name Registration",
  slug: "business-name-registration",
  summary: "Summary",
  description: "Description",
  category: "CAC",
  imageUrl: "https://example.com/service.jpg",
  amountNaira: 7000,
  displayOrder: 1,
  status: "DRAFT" as const,
};

describe("admin service validation", () => {
  beforeEach(() => {
    mocks.revalidatePath.mockReset();
    mocks.findUnique.mockReset();
    mocks.create.mockReset();
    mocks.update.mockReset();

    mocks.findUnique.mockResolvedValue(null);
    mocks.create.mockResolvedValue({ id: "svc-id", slug: validPayload.slug });
    mocks.update.mockResolvedValue({ id: "svc-id", slug: validPayload.slug });
  });

  it("enforces lowercase URL-safe slug pattern", async () => {
    await expect(
      createServiceAction({
        ...validPayload,
        slug: "Invalid Slug",
      }),
    ).rejects.toThrow("Slug must be lowercase and URL-safe");
  });

  it("requires full content before publishing", async () => {
    await expect(
      createServiceAction({
        ...validPayload,
        title: "",
        status: "PUBLISHED",
      }),
    ).rejects.toThrow("Title is required before publishing.");
  });

  it("requires positive price before publishing", async () => {
    await expect(
      createServiceAction({
        ...validPayload,
        amountNaira: null,
        status: "PUBLISHED",
      }),
    ).rejects.toThrow("Price (NGN) is required before publishing.");
  });

  it("enforces displayOrder as integer", async () => {
    await expect(
      createServiceAction({
        ...validPayload,
        displayOrder: "1.5",
      }),
    ).rejects.toThrow();
  });

  it("locks slug changes after service is published", async () => {
    mocks.findUnique.mockResolvedValueOnce({
      id: "svc-published",
      slug: "published-slug",
      status: "PUBLISHED",
    });

    await expect(
      updateServiceAction({
        ...validPayload,
        id: "svc-published",
        slug: "new-slug",
      }),
    ).rejects.toThrow("Slug cannot be changed after publishing.");
  });
});
