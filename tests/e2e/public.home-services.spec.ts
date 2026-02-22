import { test, expect } from "@playwright/test";
import { cleanupPrefix, makePrefix, seedPublicServices } from "./helpers";

test.describe("Homepage service cards", () => {
  const prefix = makePrefix("home-services");
  let publishedSlug = "";

  test.beforeAll(async () => {
    const fixtures = await seedPublicServices(prefix);
    publishedSlug = fixtures.publishedA.slug;
  });

  test.afterAll(async () => {
    await cleanupPrefix(prefix);
  });

  test("shows published services only and routes Read more to info page", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(`${prefix} Published A`)).toBeVisible();
    await expect(page.getByText(`${prefix} Published B`)).toBeVisible();
    await expect(page.getByText(`${prefix} Draft`)).toHaveCount(0);
    await expect(page.getByText(`${prefix} Archived`)).toHaveCount(0);

    const card = page.locator("article", { hasText: `${prefix} Published A` });
    await card.getByRole("link", { name: /Read more/i }).click();

    await expect(page).toHaveURL(new RegExp(`/services/${publishedSlug}$`));
  });
});
