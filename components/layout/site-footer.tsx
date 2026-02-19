import Link from "next/link";
import { Facebook, Linkedin, MapPin, Phone, Twitter } from "lucide-react";
import { contactInfo, externalLinks, quickLinks } from "@/lib/content";

const socialMap = {
  X: Twitter,
  LinkedIn: Linkedin,
  Facebook,
};

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-[var(--color-primary)] text-slate-100">
      <div className="site-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-block rounded-sm border border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold">
            NEXUS
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Trusted support for CAC registration, tax setup, and corporate compliance.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {Object.entries(socialMap).map(([label, Icon]) => (
              <Link
                key={label}
                href="#"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 text-slate-100 transition hover:bg-white/10"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {quickLinks.map((item) => (
              <li key={item}>
                <Link href="#" className="transition hover:text-white">
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
