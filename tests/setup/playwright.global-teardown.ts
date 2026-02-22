import fs from "node:fs/promises";
import path from "node:path";
import { cleanupByPrefixes, sanitizeSegment } from "./db-utils";
import { prisma } from "../../lib/prisma";

const AUTH_PATH = path.join(process.cwd(), "tests/.auth/admin.json");
const RUNTIME_PATH = path.join(process.cwd(), "tests/.tmp/e2e-runtime.json");

export default async function globalTeardown() {
  const fallbackPrefix = sanitizeSegment(process.env.TEST_PREFIX ?? "nexus-e2e");

  let prefix = fallbackPrefix;
  try {
    const runtimeRaw = await fs.readFile(RUNTIME_PATH, "utf8");
    const runtime = JSON.parse(runtimeRaw) as { prefix?: string };
    if (runtime.prefix) {
      prefix = sanitizeSegment(runtime.prefix);
    }
  } catch {
    // No runtime file available; use fallback prefix.
  }

  await cleanupByPrefixes([prefix]);

  await Promise.all([
    fs.rm(AUTH_PATH, { force: true }),
    fs.rm(RUNTIME_PATH, { force: true }),
  ]);

  await prisma.$disconnect();
}
