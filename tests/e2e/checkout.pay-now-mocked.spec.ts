import { test, expect } from "@playwright/test";
import { ServiceStatus } from "@prisma/client";
import { cleanupPrefix, fillCheckoutForm, makePrefix, mockPaystackInlineScript } from "./helpers";
import { createServiceFixture } from "../setup/db-utils";

test.describe("Checkout pay-now with mocked Paystack", () => {
  const prefix = makePrefix("pay-now");
  let serviceSlug = "";

  test.beforeAll(async () => {
    const service = await createServiceFixture({
      slug: `${prefix}-checkout`,
      title: `${prefix} PayNow Service`,
      amountKobo: 730000,
      status: ServiceStatus.PUBLISHED,
      displayOrder: 450,
    });

    serviceSlug = service.slug;
  });

  test.afterAll(async () => {
    await cleanupPrefix(prefix);
  });

  test("Pay Now success path shows success UX and redirects home", async ({ page }) => {
    await mockPaystackInlineScript(page, "success");
    await page.goto(`/services/${serviceSlug}/checkout`);

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await fillCheckoutForm(page, `${prefix}-success`);
    await page.getByRole("button", { name: /Pay NGN/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
  });

  test("Pay Now close/cancel path shows cancellation message", async ({ page }) => {
    await mockPaystackInlineScript(page, "close");
    await page.goto(`/services/${serviceSlug}/checkout`);

    await fillCheckoutForm(page, `${prefix}-cancel`);
    await page.getByRole("button", { name: /Pay NGN/i }).click();

    await expect(
      page.getByText("Payment cancelled. Your order wasn't placed yet. Try again or place an order without paying."),
    ).toBeVisible();
  });
});
