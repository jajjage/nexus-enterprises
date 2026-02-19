import type { ServiceConfig } from "@/lib/types";

export const services: ServiceConfig[] = [
  {
    slug: "cac-business-name",
    title: "Business Name Registration",
    description: "Register your business name with CAC and receive full documentation support.",
    amountKobo: 600000,
  },
  {
    slug: "company-incorporation",
    title: "Limited Company Incorporation",
    description: "Complete end-to-end company incorporation and post-registration guidance.",
    amountKobo: 1800000,
  },
  {
    slug: "tax-id-setup",
    title: "Tax Identification & Setup",
    description: "Set up your business for tax compliance with FIRS and state tax authorities.",
    amountKobo: 500000,
  },
  {
    slug: "annual-returns",
    title: "Annual Returns Filing",
    description: "Keep your entity compliant with annual filing obligations and deadlines.",
    amountKobo: 450000,
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug) ?? null;
}
