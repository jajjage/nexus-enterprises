import fs from "node:fs/promises";
import path from "node:path";
import type { FullConfig } from "@playwright/test";
import { chromium } from "@playwright/test";
import { ServiceStatus } from "@prisma/client";
import { ensureAdminUser, sanitizeSegment } from "./db-utils";
import { prisma } from "../../lib/prisma";

const AUTH_PATH = path.join(process.cwd(), "tests/.auth/admin.json");
const RUNTIME_PATH = path.join(process.cwd(), "tests/.tmp/e2e-runtime.json");

export default async function globalSetup(config: FullConfig) {
  const baseURL =
    process.env.TEST_BASE_URL ??
    String(config.projects[0]?.use?.baseURL ?? "http://127.0.0.1:3000");

  const prefix = sanitizeSegment(process.env.TEST_PREFIX ?? "nexus-e2e");
  const adminEmail =
    process.env.E2E_ADMIN_EMAIL?.trim().toLowerCase() ?? `${prefix}-admin@example.test`;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD?.trim() ?? "AdminPass123!";

  await ensureAdminUser(adminEmail, adminPassword);

  const baselineServices = [
    {
      slug: `${prefix}-baseline-published`,
      title: "Baseline Published Service",
      summary: "Baseline published summary",
      description: "Baseline published description",
      category: "Baseline",
      imageUrl:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
      amountKobo: 550000,
      status: ServiceStatus.PUBLISHED,
      displayOrder: 900,
    },
    {
      slug: `${prefix}-baseline-draft`,
      title: "Baseline Draft Service",
      summary: "Baseline draft summary",
      description: "Baseline draft description",
      category: "Baseline",
      imageUrl:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
      amountKobo: null,
      status: ServiceStatus.DRAFT,
      displayOrder: 901,
    },
  ];

  for (const service of baselineServices) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  await fs.mkdir(path.dirname(AUTH_PATH), { recursive: true });
  await fs.mkdir(path.dirname(RUNTIME_PATH), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email Address").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/admin/orders", { timeout: 45_000 });
  await page.context().storageState({ path: AUTH_PATH });

  await browser.close();

  await fs.writeFile(
    RUNTIME_PATH,
    JSON.stringify(
      {
        baseURL,
        prefix,
        adminEmail,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}
