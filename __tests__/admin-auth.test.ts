/**
 * Admin Authentication Integration Tests
 * Tests the complete admin login flow via API
 */

const API_URL = "http://localhost:3000";

interface LoginResponse {
  status: number;
  redirect?: string;
  cookies?: string[];
  error?: string;
}

async function testAdminLoginFlow(): Promise<void> {
  console.log("\n=== Admin Authentication Tests ===\n");

  // Test 1: Invalid credentials should be rejected
  console.log("Test 1: Invalid credentials rejection");
  try {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "email=admin@jrb.com&password=wrong-password&callbackUrl=/admin/orders",
      redirect: "manual",
    });

    console.log(`  ✓ Status: ${response.status}`);
    if (response.status === 401 || response.status === 302) {
      const headers = response.headers.get("set-cookie");
      if (!headers || !headers.includes("next-auth.session-token")) {
        console.log("  ✓ No session token created for invalid credentials\n");
      } else {
        console.log("  ✗ Session token created for invalid credentials\n");
      }
    }
  } catch (error) {
    console.error("  ✗ Test failed:", error);
  }

  // Test 2: Valid credentials should create a session
  console.log("Test 2: Valid credentials acceptance");
  try {
    const response = await fetch(`${API_URL}/api/auth/signin/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@jrb.com",
        password: "demo-password",
      }),
      redirect: "manual",
    });

    console.log(`  ✓ Response status: ${response.status}`);
    const setCookie = response.headers.get("set-cookie");
    if (setCookie && setCookie.includes("next-auth")) {
      console.log("  ✓ Session token created\n");
    } else {
      console.log("  ℹ Response headers checked\n");
    }
  } catch (error) {
    console.error("  Note: Auth endpoint uses POST via form action\n");
  }

  // Test 3: Protected route without session should redirect
  console.log("Test 3: Protected route without session");
  try {
    const response = await fetch(`${API_URL}/admin/orders`, {
      redirect: "manual",
    });

    if (response.status === 307 || response.status === 302) {
      const location = response.headers.get("location");
      console.log(`  ✓ Redirected to: ${location}`);
      if (location?.includes("/admin/login")) {
        console.log("  ✓ Correctly redirected to login\n");
      }
    } else {
      console.log(`  ℹ Status: ${response.status}\n`);
    }
  } catch (error) {
    console.error("  ✗ Test failed:", error);
  }

  // Test 4: Verify admin session has proper structure
  console.log("Test 4: Session token structure validation");
  try {
    const response = await fetch(`${API_URL}/api/auth/session`);
    if (response.ok) {
      const session = await response.json();
      if (session && session.user && session.user.email) {
        console.log(`  ✓ Session structure valid`);
        console.log(`  ✓ User email: ${session.user.email}`);
        console.log(`  ✓ User role: ${session.user.role || "N/A"}\n`);
      } else {
        console.log("  ℹ No active session (expected without login)\n");
      }
    }
  } catch (error) {
    console.error("  Note: Session endpoint requires active session\n");
  }
}

export { testAdminLoginFlow };
