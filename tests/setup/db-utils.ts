import bcryptjs from "bcryptjs";
import { OrderStatus, Prisma, ServiceStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";

type ServiceFixtureInput = {
  slug: string;
  title?: string;
  summary?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  amountKobo?: number | null;
  status?: ServiceStatus;
  displayOrder?: number;
};

type OrderFixtureInput = {
  serviceId: string | null;
  serviceSlug: string;
  serviceName: string;
  amountKobo: number | null;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  companyName?: string | null;
  status?: OrderStatus;
  paymentReference?: string | null;
};

const BASE_PREFIX = sanitizeSegment(process.env.TEST_PREFIX ?? "nexus-e2e");

export function sanitizeSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createSuitePrefix(scope: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return sanitizeSegment(`${BASE_PREFIX}-${scope}-${Date.now()}-${random}`);
}

export function prefixedEmail(prefix: string): string {
  return `${sanitizeSegment(prefix)}@example.test`;
}

export async function createServiceFixture(input: ServiceFixtureInput) {
  return prisma.service.create({
    data: {
      slug: sanitizeSegment(input.slug),
      title: input.title ?? "Test Service",
      summary: input.summary ?? "Test summary",
      description: input.description ?? "Detailed test description",
      category: input.category ?? "Test",
      imageUrl:
        input.imageUrl ??
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
      amountKobo: input.amountKobo === undefined ? 250000 : input.amountKobo,
      status: input.status ?? ServiceStatus.PUBLISHED,
      displayOrder: input.displayOrder ?? 999,
    },
  });
}

export async function createOrderFixture(prefix: string, input: OrderFixtureInput) {
  const tokenPrefix = sanitizeSegment(prefix).replace(/-/g, "").slice(0, 18);
  const trackingToken = `${tokenPrefix}${Math.random().toString(36).slice(2, 14)}`;
  const orderNumber = `${sanitizeSegment(prefix).toUpperCase().slice(0, 12)}-${Date.now()}`;
  const status = input.status ?? OrderStatus.AWAITING_PAYMENT;

  return prisma.order.create({
    data: {
      orderNumber,
      trackingToken,
      serviceId: input.serviceId,
      serviceSlug: input.serviceSlug,
      serviceName: input.serviceName,
      clientName: input.clientName ?? "Test Customer",
      clientEmail: input.clientEmail ?? prefixedEmail(prefix),
      clientPhone: input.clientPhone ?? "+2348012345678",
      companyName: input.companyName ?? `${prefix}-company`,
      status,
      amountKobo: input.amountKobo,
      paymentProvider: "PAYSTACK",
      paymentReference: input.paymentReference ?? null,
      logs: {
        create: {
          status,
          note: "Fixture order created",
        },
      },
    },
  });
}

export async function ensureAdminUser(email: string, password: string) {
  const hashedPassword = await bcryptjs.hash(password, 10);
  return prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: "E2E Admin",
      role: "ADMIN",
    },
  });
}

export async function cleanupByPrefixes(prefixes: string[]) {
  const normalized = Array.from(
    new Set(prefixes.map((prefix) => sanitizeSegment(prefix)).filter(Boolean)),
  );

  if (!normalized.length) {
    return;
  }

  const serviceWhere = {
    OR: normalized.map((prefix) => ({
      slug: {
        startsWith: prefix,
      },
    })),
  };

  const services = await prisma.service.findMany({
    where: serviceWhere,
    select: { id: true },
  });

  const serviceIds = services.map((service) => service.id);
  const relationFilters: Prisma.OrderLogWhereInput[] = normalized.map((prefix) => ({
    order: {
      OR: [
        {
          serviceSlug: {
            startsWith: prefix,
            mode: "insensitive",
          },
        },
        {
          clientEmail: {
            startsWith: prefix,
            mode: "insensitive",
          },
        },
        {
          paymentReference: {
            startsWith: prefix,
            mode: "insensitive",
          },
        },
      ],
    },
  }));

  if (serviceIds.length) {
    relationFilters.push({
      order: {
        serviceId: {
          in: serviceIds,
        },
      },
    });
  }

  await prisma.orderLog.deleteMany({
    where: {
      OR: relationFilters,
    },
  });

  const orderFilters: Prisma.OrderWhereInput[] = normalized.flatMap((prefix) => [
    {
      serviceSlug: {
        startsWith: prefix,
        mode: "insensitive",
      },
    },
    {
      clientEmail: {
        startsWith: prefix,
        mode: "insensitive",
      },
    },
    {
      paymentReference: {
        startsWith: prefix,
        mode: "insensitive",
      },
    },
    {
      orderNumber: {
        startsWith: prefix.toUpperCase().slice(0, 12),
      },
    },
  ]);

  if (serviceIds.length) {
    orderFilters.push({
      serviceId: {
        in: serviceIds,
      },
    });
  }

  await prisma.order.deleteMany({
    where: {
      OR: orderFilters,
    },
  });

  await prisma.service.deleteMany({
    where: serviceWhere,
  });

  await prisma.adminUser.deleteMany({
    where: {
      OR: normalized.map((prefix) => ({
        email: {
          startsWith: prefix,
          mode: "insensitive" as const,
        },
      })),
    },
  });
}
