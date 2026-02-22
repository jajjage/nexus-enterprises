import { test, expect } from "@playwright/test";
import { cleanupPrefix, loginAdminViaUi, makePrefix } from "./helpers";

test.use({ storageState: "tests/.auth/admin.json" });

test.describe("Admin services CRUD", () => {
  const prefix = makePrefix("admin-crud");
  const title = `${prefix} Admin Service`;
  const slug = `${prefix}-admin-service`;

  test.afterAll(async () => {
    await cleanupPrefix(prefix);
  });

  test("admin can create, edit, publish, lock slug, archive, and hide service publicly", async ({ page }) => {
    await page.goto("/admin/services");
    if (page.url().includes("/admin/login")) {
      await loginAdminViaUi(page);
      await page.goto("/admin/services");
    }

    await page.getByRole("link", { name: "Create Service" }).click();
    await expect(page).toHaveURL(/\/admin\/services\/new$/);

    await page.locator('input[placeholder="Business Name Registration"]').fill(title);
    await page.locator('input[placeholder="business-name-registration"]').fill(slug);
    await page
      .locator('textarea[placeholder="Short description used on homepage cards."]')
      .fill("Admin created summary for CRUD flow");
    await page
      .locator('textarea[placeholder="Detailed service information shown on the service page."]')
      .fill("Admin created description for CRUD flow");
    await page.locator('input[placeholder="CAC"]').fill("Compliance");
    await page
      .locator('input[placeholder="https://images.unsplash.com/..."]')
      .fill("https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80");
    await page.locator('input[placeholder="6000"]').fill("9000");
    await page.locator('input[type="number"]').nth(1).fill("77");

    await page.getByRole("button", { name: "Save Service" }).click();
    await expect(page).toHaveURL(/\/admin\/services\/.+/);

    await page
      .locator('textarea[placeholder="Short description used on homepage cards."]')
      .fill("Updated summary by admin");

    await page.locator("select").selectOption("PUBLISHED");
    await page.getByRole("button", { name: "Save Service" }).click();

    await expect(page.locator('input[placeholder="business-name-registration"]')).toBeDisabled();

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page.getByRole("button", { name: "Archive Service" }).click();
    await expect(page).toHaveURL(/\/admin\/services$/);

    await page.goto("/");
    await expect(page.getByText(title)).toHaveCount(0);

    await page.getByRole("button", { name: "Services" }).hover();
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);
  });
});
