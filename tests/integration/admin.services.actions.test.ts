import { ServiceStatus } from "@prisma/client";
import { beforeEach, afterAll, describe, expect, it, vi } from "vitest";

import { prisma } from "../../lib/prisma";
import {
  cleanupByPrefixes,
  createSuitePrefix,
  createServiceFixture,
} from "../setup/db-utils";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  archiveServiceAction,
  createServiceAction,
  setServiceStatusAction,
  updateServiceAction,
} from "@/app/admin/services/actions";
import { getPublishedServices } from "@/lib/services";

describe.sequential("admin service actions", () => {
  const prefix = createSuitePrefix("admin-actions");

  beforeEach(() => {
    mocks.revalidatePath.mockReset();
  });

  afterAll(async () => {
    await cleanupByPrefixes([prefix]);
  });

  it("createServiceAction creates a draft service", async () => {
    const slug = `${prefix}-create-draft`;

    const created = await createServiceAction({
      title: "Draft Service",
      slug,
      summary: "Summary",
      description: "Description",
      category: "CAC",
      imageUrl: "https://example.com/draft-service.jpg",
      amountNaira: null,
      displayOrder: 10,
      status: "DRAFT",
    });

    const service = await prisma.service.findUnique({ where: { id: created.id } });
    expect(service).toBeTruthy();
    expect(service?.slug).toBe(slug);
    expect(service?.status).toBe(ServiceStatus.DRAFT);
  });

  it("rejects duplicate slugs", async () => {
    const slug = `${prefix}-duplicate-slug`;
    await createServiceFixture({ slug, status: ServiceStatus.DRAFT });

    await expect(
      createServiceAction({
        title: "Duplicate",
        slug,
        summary: "Summary",
        description: "Description",
        category: "Tax",
        imageUrl: "https://example.com/duplicate.jpg",
        amountNaira: null,
        displayOrder: 11,
        status: "DRAFT",
      }),
    ).rejects.toThrow("A service with this slug already exists.");
  });

  it("updateServiceAction updates allowed fields", async () => {
    const service = await createServiceFixture({
      slug: `${prefix}-update-allowed`,
      title: "Before Update",
      status: ServiceStatus.DRAFT,
      amountKobo: 300000,
    });

    await updateServiceAction({
      id: service.id,
      title: "After Update",
      slug: service.slug,
      summary: "Updated summary",
      description: "Updated description",
      category: "Updated Category",
      imageUrl: "https://example.com/updated.jpg",
      amountNaira: 4500,
      displayOrder: 22,
      status: "DRAFT",
    });

    const updated = await prisma.service.findUnique({ where: { id: service.id } });
    expect(updated?.title).toBe("After Update");
    expect(updated?.summary).toBe("Updated summary");
    expect(updated?.amountKobo).toBe(450000);
    expect(updated?.displayOrder).toBe(22);
  });

  it("rejects slug changes when service is published", async () => {
    const service = await createServiceFixture({
      slug: `${prefix}-slug-lock`,
      status: ServiceStatus.PUBLISHED,
      amountKobo: 700000,
    });

    await expect(
      updateServiceAction({
        id: service.id,
        title: service.title,
        slug: `${prefix}-slug-lock-new`,
        summary: service.summary,
        description: service.description,
        category: service.category,
        imageUrl: service.imageUrl,
        amountNaira: 7000,
        displayOrder: service.displayOrder,
        status: "PUBLISHED",
      }),
    ).rejects.toThrow("Slug cannot be changed after publishing.");
  });

  it("setServiceStatusAction publishes only when required data is complete", async () => {
    const invalidDraft = await createServiceFixture({
      slug: `${prefix}-publish-invalid`,
      amountKobo: null,
      status: ServiceStatus.DRAFT,
    });

    await expect(
      setServiceStatusAction({
        id: invalidDraft.id,
        status: "PUBLISHED",
      }),
    ).rejects.toThrow("Price (NGN) is required before publishing.");

    const validDraft = await createServiceFixture({
      slug: `${prefix}-publish-valid`,
      amountKobo: 900000,
      status: ServiceStatus.DRAFT,
    });

    await expect(
      setServiceStatusAction({
        id: validDraft.id,
        status: "PUBLISHED",
      }),
    ).resolves.toEqual({ ok: true });

    const published = await prisma.service.findUnique({ where: { id: validDraft.id } });
    expect(published?.status).toBe(ServiceStatus.PUBLISHED);
  });

  it("archiveServiceAction sets ARCHIVED status", async () => {
    const service = await createServiceFixture({
      slug: `${prefix}-archive`,
      status: ServiceStatus.PUBLISHED,
      amountKobo: 500000,
    });

    await archiveServiceAction({ id: service.id });

    const archived = await prisma.service.findUnique({ where: { id: service.id } });
    expect(archived?.status).toBe(ServiceStatus.ARCHIVED);
  });

  it("archived services are excluded from published helper queries", async () => {
    const service = await createServiceFixture({
      slug: `${prefix}-exclude-published`,
      status: ServiceStatus.PUBLISHED,
      amountKobo: 500000,
      displayOrder: 5,
    });

    await archiveServiceAction({ id: service.id });
    const published = await getPublishedServices();

    expect(published.find((item) => item.slug === service.slug)).toBeUndefined();
  });

  it("revalidatePath is called for expected public/admin paths", async () => {
    const slug = `${prefix}-revalidate`;

    await createServiceAction({
      title: "Revalidate Service",
      slug,
      summary: "Summary",
      description: "Description",
      category: "CAC",
      imageUrl: "https://example.com/revalidate.jpg",
      amountNaira: null,
      displayOrder: 12,
      status: "DRAFT",
    });

    const paths = mocks.revalidatePath.mock.calls.map((call) => call[0]);
    expect(paths).toContain("/");
    expect(paths).toContain("/admin/services");
    expect(paths).toContain(`/services/${slug}`);
    expect(paths).toContain(`/services/${slug}/checkout`);
  });
});
