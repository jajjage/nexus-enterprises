import { test, expect } from "@playwright/test";
import { cleanupPrefix, makePrefix, seedPublicServices } from "./helpers";

test.describe("Desktop header dropdowns", () => {
  const prefix = makePrefix("header-desktop");
  let infoSlug = "";
  let checkoutSlug = "";

  test.beforeAll(async () => {
    const fixtures = await seedPublicServices(prefix);
    infoSlug = fixtures.publishedA.slug;
    checkoutSlug = fixtures.publishedB.slug;
  });

  test.afterAll(async () => {
    await cleanupPrefix(prefix);
  });

  test("Services dropdown links to info pages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Services" }).hover();
    await page.getByRole("link", { name: `${prefix} Published A` }).click();

    await expect(page).toHaveURL(new RegExp(`/services/${infoSlug}$`));
  });

  test("Register Business dropdown links to checkout pages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Register Business" }).hover();
    await page.getByRole("link", { name: `${prefix} Published B` }).click();

    await expect(page).toHaveURL(new RegExp(`/services/${checkoutSlug}/checkout$`));
  });

  test("Track Application CTA routes to tracking login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Track Application" }).first().click();

    await expect(page).toHaveURL(/\/track\/login/);
  });
});
