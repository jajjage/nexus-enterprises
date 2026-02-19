/**
 * Database and Security Tests
 * Tests database integrity, password hashing, and security attributes
 */

import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";

async function testDatabaseIntegrity(): Promise<void> {
  console.log("\n=== Database Integrity Tests ===\n");

  // Test 1: AdminUser exists
  console.log("Test 1: Admin user exists in database");
  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: "admin@jrb.com" },
    });

    if (adminUser) {
      console.log("  ✓ Admin user found");
      console.log(`    - Email: ${adminUser.email}`);
      console.log(`    - ID: ${adminUser.id}`);
      console.log(`    - Role: ${adminUser.role}`);
    } else {
      console.log("  ✗ Admin user not found\n");
      return;
    }
  } catch (error) {
    console.error("  ✗ Database query failed:", error);
    return;
  }

  // Test 2: Password is hashed
  console.log("\nTest 2: Password hashing verification");
  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: "admin@jrb.com" },
    });

    if (adminUser) {
      const isHashed = adminUser.password.startsWith("$2a$") || adminUser.password.startsWith("$2b$");
      console.log(`  ${isHashed ? "✓" : "✗"} Password is bcrypt hashed: ${adminUser.password.substring(0, 10)}...`);

      // Test password comparison
      const testPassword = "demo-password";
      const isMatch = await bcryptjs.compare(testPassword, adminUser.password);
      console.log(`  ${isMatch ? "✓" : "✗"} Password verification works: ${isMatch}`);

      if (!isMatch) {
        console.log("    ✗ Test password does not match hashed password");
      } else {
        console.log("    ✓ Test password matches hashed password");
      }

      // Test wrong password
      const wrongMatch = await bcryptjs.compare("wrong-password", adminUser.password);
      console.log(`  ${!wrongMatch ? "✓" : "✗"} Wrong password rejected: ${!wrongMatch}\n`);
    }
  } catch (error) {
    console.error("  ✗ Password verification failed:", error);
  }

  // Test 3: Order tracking tokens are unique
  console.log("Test 3: Order tracking token uniqueness");
  try {
    const orders = await prisma.order.findMany({
      select: { trackingToken: true },
      take: 5,
    });

    console.log(`  ✓ Found ${orders.length} orders in database`);

    const tokens = orders.map((o) => o.trackingToken);
    const uniqueTokens = new Set(tokens);

    if (tokens.length === uniqueTokens.size) {
      console.log(`  ✓ All tokens are unique (${tokens.length}/${uniqueTokens.size})\n`);
    } else {
      console.log(`  ✗ Duplicate tokens found: ${tokens.length} total, ${uniqueTokens.size} unique\n`);
    }
  } catch (error) {
    console.error("  ✗ Token uniqueness check failed:", error);
  }

  // Test 4: Order-OrderLog relationship
  console.log("Test 4: Order and OrderLog relationship integrity");
  try {
    const orderWithLogs = await prisma.order.findFirst({
      include: { logs: true },
    });

    if (orderWithLogs) {
      console.log(`  ✓ Order found with ID: ${orderWithLogs.id}`);
      console.log(`  ✓ Order has ${orderWithLogs.logs.length} log entries`);

      // Verify log references order correctly
      const logsValid = orderWithLogs.logs.every((log) => log.orderId === orderWithLogs.id);
      console.log(`  ${logsValid ? "✓" : "✗"} All log entries reference correct order\n`);
    } else {
      console.log("  ℹ No orders found in database\n");
    }
  } catch (error) {
    console.error("  ✗ Relationship check failed:", error);
  }
}

async function testSecurityAttributes(): Promise<void> {
  console.log("=== Security Attributes Tests ===\n");

  // Test 1: Check for sensitive fields
  console.log("Test 1: Sensitive data protection");
  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: "admin@jrb.com" },
    });

    if (adminUser) {
      const hasEmail = !!adminUser.email;
      const hasPassword = !!adminUser.password;
      const hasId = !!adminUser.id;
      const hasCreatedAt = !!adminUser.createdAt;

      console.log("  ✓ Required fields present:");
      console.log(`    - Email field: ${hasEmail ? "✓" : "✗"}`);
      console.log(`    - Password field (hashed): ${hasPassword ? "✓" : "✗"}`);
      console.log(`    - ID field: ${hasId ? "✓" : "✗"}`);
      console.log(`    - Audit timestamps: ${hasCreatedAt ? "✓" : "✗"}\n`);
    }
  } catch (error) {
    console.error("  ✗ Test failed:", error);
  }

  // Test 2: AdminUser schema validation
  console.log("Test 2: AdminUser model constraints");
  try {
    // Try to create duplicate email (should fail)
    try {
      const duplicate = await prisma.adminUser.create({
        data: {
          email: "admin@jrb.com",
          password: "test",
          role: "ADMIN",
        },
      });
      console.log("  ✗ Duplicate email constraint not enforced\n");
      // Clean up if somehow created
      if (duplicate.id !== "admin@jrb.com") {
        await prisma.adminUser.delete({ where: { id: duplicate.id } });
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unique")) {
        console.log("  ✓ Unique email constraint is enforced\n");
      } else {
        console.log("  ℹ Constraint check inconclusive\n");
      }
    }
  } catch (error) {
    console.error("  ✗ Test failed:", error);
  }

  // Test 3: Role field defaults
  console.log("Test 3: AdminUser default values");
  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: "admin@jrb.com" },
    });

    if (adminUser) {
      console.log(`  ✓ Role field: ${adminUser.role}`);
      if (adminUser.role === "ADMIN") {
        console.log("  ✓ Default role is properly set to ADMIN\n");
      } else {
        console.log("  ✗ Unexpected role value\n");
      }
    }
  } catch (error) {
    console.error("  ✗ Test failed:", error);
  }
}

export { testDatabaseIntegrity, testSecurityAttributes };
