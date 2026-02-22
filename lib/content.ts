import type { LucideIcon } from "lucide-react";
import { Bolt, Building2, Clock3, FileCheck2, Landmark, ShieldCheck } from "lucide-react";

export type NavItem = { label: string; href: string };

export type TrustIndicator = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type PartnerLogo = {
  name: string;
  image: string;
  href?: string;
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/#who-we-are" },
  { label: "Services", href: "/#services" },
  { label: "Resources", href: "/blog" },
  { label: "Contact", href: "#footer" },
];

export const trustIndicators: TrustIndicator[] = [
  {
    icon: Clock3,
    title: "Speed",
    description: "Fast, process-driven execution for time-sensitive filings.",
  },
  {
    icon: ShieldCheck,
    title: "Reliability",
    description: "Compliance-focused handling across CAC, Tax, and reporting.",
  },
  {
    icon: Bolt,
    title: "Support",
    description: "Direct guidance from onboarding through approval stages.",
  },
];

export const partnerLogos: PartnerLogo[] = [
  {
    name: "CAC",
    image: "https://via.placeholder.com/180x64?text=CAC",
    href: "https://www.cac.gov.ng",
  },
  {
    name: "FIRS",
    image: "https://via.placeholder.com/180x64?text=FIRS",
    href: "https://www.firs.gov.ng",
  },
  {
    name: "SCUML",
    image: "https://via.placeholder.com/180x64?text=SCUML",
    href: "https://scuml.org",
  },
  {
    name: "NIPC",
    image: "https://via.placeholder.com/180x64?text=NIPC",
    href: "https://www.nipc.gov.ng",
  },
  {
    name: "SMEDAN",
    image: "https://via.placeholder.com/180x64?text=SMEDAN",
    href: "https://www.smedan.gov.ng",
  },
];

export const quickLinks = ["Home", "About Us", "Services", "Resources", "Contact"];

export const externalLinks = [
  { label: "CAC Official Site", href: "https://www.cac.gov.ng" },
  { label: "FIRS Portal", href: "https://www.firs.gov.ng" },
  { label: "SCUML Registration", href: "https://scuml.org" },
];

export const contactInfo = {
  address: "18 Civic Towers, Victoria Island, Lagos, Nigeria",
  phone: "+234 (0) 800 123 4567",
  email: "hello@nexusenterprises.com",
};

export const footerSocials = [
  { label: "X", href: "https://twitter.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Facebook", href: "https://facebook.com" },
];

export const whoWeAreCta = [
  { label: "Learn More", href: "/blog", variant: "primary" as const },
  { label: "Contact Us", href: "#footer", variant: "secondary" as const },
];

export const coreServiceIcon = {
  CAC: Building2,
  Tax: Landmark,
  Filings: FileCheck2,
};
