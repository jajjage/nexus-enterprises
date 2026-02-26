import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { navItems } from "@/lib/content";
import { getPublishedServices } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const services = await getPublishedServices();

  return (
    <>
      <SiteHeader navItems={navItems} services={services} />
      {children}
      <SiteFooter />
    </>
  );
}
