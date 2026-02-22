import "server-only";

import { ServiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ServiceCatalogItem } from "@/lib/types";

const SERVICE_SELECT = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  description: true,
  category: true,
  imageUrl: true,
  amountKobo: true,
  status: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

function mapService(
  service: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    description: string;
    category: string;
    imageUrl: string;
    amountKobo: number | null;
    status: ServiceStatus;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
  },
): ServiceCatalogItem {
  return {
    id: service.id,
    slug: service.slug,
    title: service.title,
    summary: service.summary,
    description: service.description,
    category: service.category,
    imageUrl: service.imageUrl,
    amountKobo: service.amountKobo,
    status: service.status,
    displayOrder: service.displayOrder,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}

export async function getPublishedServices(): Promise<ServiceCatalogItem[]> {
  const services = await prisma.service.findMany({
    where: {
      status: ServiceStatus.PUBLISHED,
    },
    select: SERVICE_SELECT,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });

  return services.map(mapService);
}

export async function getPublishedServiceBySlug(
  slug: string,
): Promise<ServiceCatalogItem | null> {
  const service = await prisma.service.findFirst({
    where: {
      slug,
      status: ServiceStatus.PUBLISHED,
    },
    select: SERVICE_SELECT,
  });

  return service ? mapService(service) : null;
}

export async function getServiceBySlugAnyStatus(
  slug: string,
): Promise<ServiceCatalogItem | null> {
  const service = await prisma.service.findUnique({
    where: {
      slug,
    },
    select: SERVICE_SELECT,
  });

  return service ? mapService(service) : null;
}

export async function getServiceByIdAnyStatus(
  id: string,
): Promise<ServiceCatalogItem | null> {
  const service = await prisma.service.findUnique({
    where: {
      id,
    },
    select: SERVICE_SELECT,
  });

  return service ? mapService(service) : null;
}

export async function getCheckoutServiceBySlug(
  slug: string,
): Promise<(ServiceCatalogItem & { amountKobo: number }) | null> {
  const service = await prisma.service.findFirst({
    where: {
      slug,
      status: ServiceStatus.PUBLISHED,
      amountKobo: {
        gt: 0,
      },
    },
    select: SERVICE_SELECT,
  });

  if (!service || !service.amountKobo || service.amountKobo <= 0) {
    return null;
  }

  return {
    ...mapService(service),
    amountKobo: service.amountKobo,
  };
}

