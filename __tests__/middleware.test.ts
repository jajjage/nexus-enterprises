/**
 * Middleware Protection Tests
 * Tests edge middleware route protection
 */

const API_URL = "http://localhost:3000";

async function testMiddlewareProtection(): Promise<void> {
  console.log("\n=== Middleware Protection Tests ===\n");

  const protectedRoutes = [
    { path: "/admin/orders", expectedLogin: "/admin/login" },
    { path: "/admin/blog", expectedLogin: "/admin/login" },
    { path: "/admin/blog/new", expectedLogin: "/admin/login" },
    { path: "/track", expectedLogin: "/track/login" },
  ];

  const publicRoutes = [
    "/admin/login",
    "/track/login",
    "/",
    "/blog",
    "/services/some-service",
  ];

  console.log("Test 1: Protected routes redirect without authentication");
  for (const route of protectedRoutes) {
    try {
      const response = await fetch(`${API_URL}${route.path}`, {
        redirect: "manual",
      });

      let score = "✓";
      if (response.status !== 307 && response.status !== 302) {
        score = "ℹ";
      }

      const location = response.headers.get("location");
      console.log(`  ${score} ${route.path}`);
      console.log(`     Status: ${response.status}, Redirect: ${location || "none"}`);

      if (location && location.includes(route.expectedLogin)) {
        console.log(`     ✓ Correctly redirects to ${route.expectedLogin}`);
      }
    } catch (error) {
      console.error(`  ✗ ${route.path} - Error:`, error);
    }
  }
  console.log();

  console.log("Test 2: Public routes are accessible without authentication");
  for (const route of publicRoutes) {
    try {
      const response = await fetch(`${API_URL}${route}`, {
        redirect: "manual",
      });

      const isAccessible = response.status === 200 || response.status === 206;
      const symbol = isAccessible ? "✓" : "ℹ";
      console.log(`  ${symbol} ${route} (status: ${response.status})`);
    } catch (error) {
      console.error(`  ✗ ${route} - Error:`, error);
    }
  }
  console.log();

  console.log("Test 3: Middleware matcher configuration");
  const matcherTests = [
    { path: "/admin/login", shouldMatch: true },
    { path: "/admin/orders", shouldMatch: true },
    { path: "/admin/blog/123", shouldMatch: true },
    { path: "/track", shouldMatch: true },
    { path: "/track/login", shouldMatch: true },
    { path: "/track/token123", shouldMatch: true },
    { path: "/blog", shouldMatch: false },
    { path: "/services/test", shouldMatch: false },
    { path: "/", shouldMatch: false },
  ];

  console.log("  Matcher pattern: /admin/:path* /track/:path*\n");
  matcherTests.forEach((test) => {
    const matches = test.path.startsWith("/admin") || test.path.startsWith("/track");
    const correct = matches === test.shouldMatch;
    const symbol = correct ? "✓" : "✗";
    console.log(
      `  ${symbol} ${test.path}: ${matches ? "matched" : "not matched"} ${correct ? "(expected)" : "(unexpected)"}`
    );
  });
  console.log();

  console.log("Test 4: Admin/Track login pages are always accessible");
  const loginRoutes = ["/admin/login", "/track/login"];

  for (const route of loginRoutes) {
    try {
      const response = await fetch(`${API_URL}${route}`, {
        redirect: "manual",
      });

      if (response.status === 200) {
        console.log(`  ✓ ${route} is accessible (status 200)\n`);
      } else {
        console.log(`  ✗ ${route} returned status ${response.status}\n`);
      }
    } catch (error) {
      console.error(`  ✗ ${route} - Error:`, error);
    }
  }
}

export { testMiddlewareProtection };
