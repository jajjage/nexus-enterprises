import Link from "next/link";
import { Facebook, Linkedin, MapPin, Phone, Twitter } from "lucide-react";
import { contactInfo, externalLinks, footerSocials, quickLinks } from "@/lib/content";
import { FOOTER_LINKS } from "@/config/routes";

const socialMap = {
  X: Twitter,
  LinkedIn: Linkedin,
  Facebook,
};

const getQuickLinkHref = (label: string): string => {
  const linkMap: Record<string, string> = {
    Home: FOOTER_LINKS.HOME,
    "About Us": FOOTER_LINKS.ABOUT,
    Services: FOOTER_LINKS.SERVICES,
    Resources: FOOTER_LINKS.BLOG,
    Contact: "#footer",
  };
  return linkMap[label] || "#";
};

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-(--color-primary) text-slate-100">
      <div className="site-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-block rounded-sm border border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold">
            NEXUS
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Trusted support for CAC registration, tax setup, and corporate compliance.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {footerSocials.map((social) => {
              const Icon = socialMap[social.label as keyof typeof socialMap];
              return Icon ? (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 text-slate-100 transition hover:bg-white/10"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ) : null;
            })}
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {quickLinks.map((item) => (
              <li key={item}>
                <Link href={getQuickLinkHref(item)} className="transition hover:text-white">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">External Links</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {externalLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="transition hover:text-white" target="_blank">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{contactInfo.address}</span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{contactInfo.phone}</span>
            </li>
            <li>
              <Link href={`mailto:${contactInfo.email}`} className="transition hover:text-white">
                {contactInfo.email}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15 py-4">
        <p className="site-container text-center text-xs text-slate-300">
          Copyright {year} Nexus Enterprises. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
