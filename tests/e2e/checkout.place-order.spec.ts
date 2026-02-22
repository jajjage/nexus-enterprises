import { test, expect } from "@playwright/test";
import { ServiceStatus } from "@prisma/client";
import {
  cleanupPrefix,
  fillCheckoutForm,
  findOrderByEmail,
  makePrefix,
  mockPaystackInlineScript,
} from "./helpers";
import { createServiceFixture, prefixedEmail } from "../setup/db-utils";

test.describe("Checkout place-order flow", () => {
  const prefix = makePrefix("place-order");
  let serviceSlug = "";

  test.beforeAll(async () => {
    const service = await createServiceFixture({
      slug: `${prefix}-checkout`,
      title: `${prefix} Checkout Service`,
      amountKobo: 620000,
      status: ServiceStatus.PUBLISHED,
      displayOrder: 401,
    });
    serviceSlug = service.slug;
  });

  test.afterAll(async () => {
    await cleanupPrefix(prefix);
  });

  test("valid form place-order creates order and redirects to tracking URL", async ({ page }) => {
    await mockPaystackInlineScript(page, "success");
    await page.goto(`/services/${serviceSlug}/checkout`);

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await fillCheckoutForm(page, prefix);
    await page.getByRole("button", { name: "Place Order" }).click();

    await expect(page).toHaveURL(/\/track\/[a-z0-9]+/i);

    const order = await findOrderByEmail(prefixedEmail(prefix));
    expect(order).toBeTruthy();
    expect(order?.serviceSlug).toBe(serviceSlug);
    expect(order?.serviceId).toBeTruthy();
    expect(order?.status).toBe("AWAITING_PAYMENT");
  });

  test("invalid form fields show validation errors", async ({ page }) => {
    await mockPaystackInlineScript(page, "success");
    await page.goto(`/services/${serviceSlug}/checkout`);

    await page.getByLabel("Full Name *").fill("Bad User");
    await page.getByLabel("Email Address *").fill("not-an-email");
    await page.getByLabel("Phone Number *").fill("+2348013333333");

    await page.getByRole("button", { name: "Place Order" }).click();

    await expect(page.getByText("Invalid email address")).toBeVisible();
  });
});
