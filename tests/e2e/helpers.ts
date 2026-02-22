import { expect, type Page } from "@playwright/test";
import { ServiceStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import {
  cleanupByPrefixes,
  createServiceFixture,
  createSuitePrefix,
  prefixedEmail,
  sanitizeSegment,
} from "../setup/db-utils";

export async function seedPublicServices(prefix: string) {
  const publishedA = await createServiceFixture({
    slug: `${prefix}-published-a`,
    title: `${prefix} Published A`,
    summary: "Published service A",
    description: "Published service A description",
    amountKobo: 450000,
    status: ServiceStatus.PUBLISHED,
    displayOrder: 201,
  });

  const publishedB = await createServiceFixture({
    slug: `${prefix}-published-b`,
    title: `${prefix} Published B`,
    summary: "Published service B",
    description: "Published service B description",
    amountKobo: 550000,
    status: ServiceStatus.PUBLISHED,
    displayOrder: 202,
  });

  const draft = await createServiceFixture({
    slug: `${prefix}-draft`,
    title: `${prefix} Draft`,
    amountKobo: null,
    status: ServiceStatus.DRAFT,
    displayOrder: 203,
  });

  const archived = await createServiceFixture({
    slug: `${prefix}-archived`,
    title: `${prefix} Archived`,
    amountKobo: 300000,
    status: ServiceStatus.ARCHIVED,
    displayOrder: 204,
  });

  return {
    publishedA,
    publishedB,
    draft,
    archived,
  };
}

export async function mockPaystackInlineScript(page: Page, mode: "success" | "close" = "success") {
  await page.route("https://js.paystack.co/v1/inline.js", async (route) => {
    const body = `
      window.PaystackPop = {
        setup: function(options) {
          return {
            openIframe: function() {
              setTimeout(function() {
                if (${mode === "success"}) {
                  options.onSuccess && options.onSuccess({ reference: options.ref || 'PAY-MOCK-REF' });
                } else {
                  options.onClose && options.onClose();
                }
              }, 40);
            }
          };
        }
      };
    `;

    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body,
    });
  });
}

export async function fillCheckoutForm(page: Page, prefix: string) {
  await page.getByLabel("Full Name *").fill("E2E Checkout User");
  await page.getByLabel("Email Address *").fill(prefixedEmail(prefix));
  await page.getByLabel("Phone Number *").fill("+2348013333333");
  await page.getByLabel("Company Name (Optional)").fill(`${prefix}-company`);
}

export async function loginAdminViaUi(page: Page) {
  const adminEmail =
    process.env.E2E_ADMIN_EMAIL?.trim().toLowerCase() ??
    `${sanitizeSegment(process.env.TEST_PREFIX ?? "nexus-e2e")}-admin@example.test`;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD?.trim() ?? "AdminPass123!";

  await page.goto("/admin/login");
  await page.getByLabel("Email Address").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/admin/orders");
}

export function makePrefix(scope: string) {
  return createSuitePrefix(`pw-${scope}`);
}

export async function cleanupPrefix(prefix: string) {
  await cleanupByPrefixes([prefix]);
}

export async function findOrderByEmail(email: string) {
  return prisma.order.findFirst({
    where: { clientEmail: email },
    orderBy: { createdAt: "desc" },
  });
}

export async function expectPathContains(page: Page, expected: string) {
  await expect(page).toHaveURL(new RegExp(expected));
}
