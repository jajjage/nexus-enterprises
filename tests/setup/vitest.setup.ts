import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, vi } from "vitest";

const envTestPath = path.resolve(process.cwd(), ".env.test");
if (existsSync(envTestPath) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(envTestPath);
}

Object.assign(process.env, { NODE_ENV: "test" });
process.env.NEXTAUTH_SECRET ??= "vitest-nextauth-secret";
process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ??= "pk_test_vitest_public_key";
process.env.PAYSTACK_SECRET_KEY ??= "sk_test_vitest_secret_key";
process.env.SITE_URL ??= "http://localhost:3000";
process.env.TEST_PREFIX ??= "nexus-test";

afterEach(() => {
  vi.clearAllMocks();
});
