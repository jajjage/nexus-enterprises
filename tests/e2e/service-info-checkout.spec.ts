import { test, expect } from "@playwright/test";
import { ServiceStatus } from "@prisma/client";
import {
  cleanupPrefix,
  makePrefix,
  mockPaystackInlineScript,
  seedPublicServices,
} from "./helpers";
import { createServiceFixture } from "../setup/db-utils";

test.describe("Service info and checkout routing", () => {
  const prefix = makePrefix("service-info");
  let publishedSlug = "";
  let draftSlug = "";

  test.beforeAll(async () => {
    const fixtures = await seedPublicServices(prefix);
    publishedSlug = fixtures.publishedA.slug;

    const draft = await createServiceFixture({
      slug: `${prefix}-unpublished`,
      title: `${prefix} Unpublished`,
      amountKobo: null,
      status: ServiceStatus.DRAFT,
      displayOrder: 300,
    });
    draftSlug = draft.slug;
  });

  test.afterAll(async () => {
    await cleanupPrefix(prefix);
  });

  test("info page renders content and Proceed to Payment routes to checkout", async ({ page }) => {
    await mockPaystackInlineScript(page, "success");
    await page.goto(`/services/${publishedSlug}`);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(`${prefix} Published A`);
    await expect(page.getByText("Published service A description")).toBeVisible();
    await expect(page.getByText("Published service A")).toBeVisible();

    await page.getByRole("link", { name: "Proceed to Payment" }).click();
    await expect(page).toHaveURL(new RegExp(`/services/${publishedSlug}/checkout$`));
  });

  test("unpublished service info URL shows not-found behavior", async ({ page }) => {
    await page.goto(`/services/${draftSlug}`);
    await expect(page.getByText(/not found|could not be found/i)).toBeVisible();
  });
});
