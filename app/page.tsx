import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { HeroSection } from "@/components/sections/hero-section";
import { NewsletterCta } from "@/components/sections/newsletter-cta";
import { PartnersStrip } from "@/components/sections/partners-strip";
import { ServicesGrid } from "@/components/sections/services-grid";
import { WhoWeAreSection } from "@/components/sections/who-we-are-section";
import { navItems, partnerLogos, trustIndicators } from "@/lib/content";
import { getPublishedServices } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function Home() {
  const services = await getPublishedServices();

  return (
    <>
      <SiteHeader navItems={navItems} services={services} />
      <main>
        <HeroSection />
        <WhoWeAreSection indicators={trustIndicators} />
        <ServicesGrid services={services} />
        <PartnersStrip partners={partnerLogos} />
        <NewsletterCta />
      </main>
      <SiteFooter />
    </>
  );
}
