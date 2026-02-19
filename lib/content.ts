import type { LucideIcon } from "lucide-react";
import { Bolt, Building2, Clock3, FileCheck2, Landmark, ShieldCheck } from "lucide-react";

export type NavItem = { label: string; href: string };

export type TrustIndicator = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type ServiceCard = {
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  href: string;
};

export type PartnerLogo = {
  name: string;
  image: string;
  href?: string;
};

export const navItems: NavItem[] = [
  { label: "Home", href: "#" },
  { label: "About Us", href: "#who-we-are" },
  { label: "Services", href: "#services" },
  { label: "Resources", href: "#newsletter" },
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

export const serviceCards: ServiceCard[] = [
  {
    category: "CAC",
    date: "Feb 12, 2026",
    title: "Business Name Registration",
    excerpt: "Secure and register your business identity with complete CAC support.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    href: "/services/cac-business-name",
  },
  {
    category: "CAC",
    date: "Feb 10, 2026",
    title: "Limited Company Incorporation",
    excerpt: "End-to-end incorporation process management for private companies.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    href: "/services/company-incorporation",
  },
  {
    category: "Tax",
    date: "Feb 8, 2026",
    title: "Tax Identification & Setup",
    excerpt: "Get your tax profile activated with the relevant authorities.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    href: "/services/tax-id-setup",
  },
  {
    category: "Filings",
    date: "Feb 6, 2026",
    title: "Annual Returns Compliance",
    excerpt: "Maintain statutory compliance with accurate annual filing support.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80",
    href: "/services/annual-returns",
  },
  {
    category: "Regulatory",
    date: "Feb 4, 2026",
    title: "SCUML Registration",
    excerpt: "Smooth anti-money laundering registration support for businesses.",
    image: "https://images.unsplash.com/photo-1462899006636-339e08d1844e?auto=format&fit=crop&w=900&q=80",
    href: "#",
  },
  {
    category: "Post-Incorporation",
    date: "Feb 3, 2026",
    title: "Corporate Changes & Updates",
    excerpt: "Update directors, shareholding, and registered details correctly.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    href: "#",
  },
];

export const partnerLogos: PartnerLogo[] = [
  {
    name: "CAC",
    image: "https://via.placeholder.com/180x64?text=CAC",
    href: "#",
  },
  {
    name: "FIRS",
    image: "https://via.placeholder.com/180x64?text=FIRS",
    href: "#",
  },
  {
    name: "SCUML",
    image: "https://via.placeholder.com/180x64?text=SCUML",
    href: "#",
  },
  {
    name: "NIPC",
    image: "https://via.placeholder.com/180x64?text=NIPC",
    href: "#",
  },
  {
    name: "SMEDAN",
    image: "https://via.placeholder.com/180x64?text=SMEDAN",
    href: "#",
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
  { label: "X", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Facebook", href: "#" },
];

export const whoWeAreCta = [
  { label: "Learn More", href: "#", variant: "primary" as const },
  { label: "Contact Us", href: "#", variant: "secondary" as const },
];

export const coreServiceIcon = {
  CAC: Building2,
  Tax: Landmark,
  Filings: FileCheck2,
};
