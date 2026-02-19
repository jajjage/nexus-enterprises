import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { HeroSection } from "@/components/sections/hero-section";
import { NewsletterCta } from "@/components/sections/newsletter-cta";
import { PartnersStrip } from "@/components/sections/partners-strip";
import { ServicesGrid } from "@/components/sections/services-grid";
import { WhoWeAreSection } from "@/components/sections/who-we-are-section";
import { navItems, partnerLogos, serviceCards, trustIndicators } from "@/lib/content";

export default function Home() {
  return (
    <>
      <SiteHeader navItems={navItems} />
      <main>
        <HeroSection />
        <WhoWeAreSection indicators={trustIndicators} />
        <ServicesGrid services={serviceCards} />
        <PartnersStrip partners={partnerLogos} />
        <NewsletterCta />
      </main>
      <SiteFooter />
    </>
  );
}
