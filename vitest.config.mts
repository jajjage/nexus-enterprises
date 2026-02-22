import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "server-only": path.resolve(__dirname, "tests/setup/server-only-stub.ts"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    setupFiles: ["tests/setup/vitest.setup.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage/vitest",
      include: [
        "lib/services.ts",
        "lib/paystack.ts",
        "app/actions/track-session.ts",
        "app/admin/services/actions.ts",
        "app/services/[service-slug]/actions.ts",
        "app/services/[service-slug]/checkout-action.ts",
        "app/api/webhooks/paystack/route.ts",
        "middleware.ts",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
    sequence: {
      concurrent: false,
    },
  },
});
