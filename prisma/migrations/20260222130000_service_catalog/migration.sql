-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "amountKobo" INTEGER,
    "status" "ServiceStatus" NOT NULL DEFAULT 'DRAFT',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "serviceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_status_displayOrder_idx" ON "Service"("status", "displayOrder");

-- CreateIndex
CREATE INDEX "Order_serviceId_idx" ON "Order"("serviceId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed initial service catalog
INSERT INTO "Service" ("id", "slug", "title", "summary", "description", "category", "imageUrl", "amountKobo", "status", "displayOrder", "createdAt", "updatedAt")
VALUES
  (
    'svc_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24),
    'cac-business-name',
    'Business Name Registration',
    'Secure and register your business identity with complete CAC support.',
    'Register your business name with CAC and receive full documentation support.',
    'CAC',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
    600000,
    'PUBLISHED',
    1,
    NOW(),
    NOW()
  ),
  (
    'svc_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24),
    'company-incorporation',
    'Limited Company Incorporation',
    'End-to-end incorporation process management for private companies.',
    'Complete end-to-end company incorporation and post-registration guidance.',
    'CAC',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
    1800000,
    'PUBLISHED',
    2,
    NOW(),
    NOW()
  ),
  (
    'svc_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24),
    'tax-id-setup',
    'Tax Identification & Setup',
    'Get your tax profile activated with the relevant authorities.',
    'Set up your business for tax compliance with FIRS and state tax authorities.',
    'Tax',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    500000,
    'PUBLISHED',
    3,
    NOW(),
    NOW()
  ),
  (
    'svc_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24),
    'annual-returns',
    'Annual Returns Compliance',
    'Maintain statutory compliance with accurate annual filing support.',
    'Keep your entity compliant with annual filing obligations and deadlines.',
    'Filings',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80',
    450000,
    'PUBLISHED',
    4,
    NOW(),
    NOW()
  ),
  (
    'svc_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24),
    'scuml-registration',
    'SCUML Registration',
    'Smooth anti-money laundering registration support for businesses.',
    'End-to-end support for SCUML registration and related compliance documentation.',
    'Regulatory',
    'https://images.unsplash.com/photo-1462899006636-339e08d1844e?auto=format&fit=crop&w=900&q=80',
    NULL,
    'DRAFT',
    5,
    NOW(),
    NOW()
  ),
  (
    'svc_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24),
    'corporate-changes-updates',
    'Corporate Changes & Updates',
    'Update directors, shareholding, and registered details correctly.',
    'Manage post-incorporation updates including directors, shareholding, and company records.',
    'Post-Incorporation',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80',
    NULL,
    'DRAFT',
    6,
    NOW(),
    NOW()
  )
ON CONFLICT ("slug") DO NOTHING;
