import { test, expect, devices } from "@playwright/test";
import { cleanupPrefix, makePrefix, seedPublicServices } from "./helpers";

test.use({ ...devices["iPhone 13"] });

test.describe("Mobile header dropdowns", () => {
  const prefix = makePrefix("header-mobile");
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

  test("mobile menu opens and Services submenu routes to info page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "Services" }).click();
    await page.getByRole("link", { name: `${prefix} Published A` }).click();

    await expect(page).toHaveURL(new RegExp(`/services/${infoSlug}$`));
  });

  test("mobile Register Business submenu routes to checkout", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "Register Business" }).click();
    await page.getByRole("link", { name: `${prefix} Published B` }).click();

    await expect(page).toHaveURL(new RegExp(`/services/${checkoutSlug}/checkout$`));
  });
});
