import { test, expect } from "@playwright/test";
import { ServiceStatus } from "@prisma/client";
import { cleanupPrefix, makePrefix } from "./helpers";
import { createOrderFixture, createServiceFixture } from "../setup/db-utils";

test.describe("Tracking login and session flow", () => {
  const prefix = makePrefix("tracking");
  let trackingToken = "";
  let orderNumber = "";

  test.beforeAll(async () => {
    const service = await createServiceFixture({
      slug: `${prefix}-service`,
      title: `${prefix} Tracking Service`,
      amountKobo: 400000,
      status: ServiceStatus.PUBLISHED,
      displayOrder: 500,
    });

    const order = await createOrderFixture(prefix, {
      serviceId: service.id,
      serviceSlug: service.slug,
      serviceName: service.title,
      amountKobo: 400000,
    });

    trackingToken = order.trackingToken;
    orderNumber = order.orderNumber;
  });

  test.afterAll(async () => {
    await cleanupPrefix(prefix);
  });

  test("tracking login accepts token and opens tracking page", async ({ page }) => {
    await page.goto("/track/login");
    await page.getByLabel("Tracking ID or Order Number").fill(trackingToken);
    await page.getByRole("button", { name: "View Order Status" }).click();

    await expect(page).toHaveURL(/\/track$/);
    await expect(page.getByText(orderNumber)).toBeVisible();
  });

  test("tracking login accepts order number", async ({ page }) => {
    await page.goto("/track/login");
    await page.getByLabel("Tracking ID or Order Number").fill(orderNumber);
    await page.getByRole("button", { name: "View Order Status" }).click();

    await expect(page).toHaveURL(/\/track$/);
    await expect(page.getByText(orderNumber)).toBeVisible();
  });

  test("invalid input returns invalid tracking message", async ({ page }) => {
    await page.goto("/track/login");
    await page.getByLabel("Tracking ID or Order Number").fill("invalid-token-value");
    await page.getByRole("button", { name: "View Order Status" }).click();

    await expect(page).toHaveURL(/error=invalid_token/);
    await expect(page.getByText("Invalid tracking ID or order number. Please check and try again.")).toBeVisible();
  });

  test("tracking page remains accessible after session cookie is set", async ({ page }) => {
    await page.goto(`/track/${trackingToken}`);
    await page.waitForURL("**/track");

    await page.goto("/track");
    await expect(page.getByText("Order ID")).toBeVisible();
    await expect(page.getByText("Progress Timeline")).toBeVisible();
  });
});
