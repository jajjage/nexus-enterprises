import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    console.log(
      "⚠️  SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables are required to seed the database.",
    );
    console.log(
      'Example: SEED_ADMIN_EMAIL="admin@example.com" SEED_ADMIN_PASSWORD="password123" npm run seed',
    );
    return;
  }

  try {
    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Upsert the admin user
    const adminUser = await prisma.adminUser.upsert({
      where: { email },
      update: {
        password: hashedPassword,
      },
      create: {
        email,
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
      },
    });

    console.log("✅ Admin user seeded successfully:");
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   ID: ${adminUser.id}`);
  } catch (error) {
    console.error("❌ Failed to seed admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
