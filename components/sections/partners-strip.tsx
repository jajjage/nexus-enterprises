import Link from "next/link";
import type { PartnerLogo } from "@/lib/content";

type PartnersStripProps = {
  partners: PartnerLogo[];
};

export function PartnersStrip({ partners }: PartnersStripProps) {
  return (
    <section className="section-space bg-white">
      <div className="site-container text-center">
        <h2 className="text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl">
          Regulatory Bodies &amp; Partners
        </h2>

        <div className="mt-10 grid grid-cols-2 items-center gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {partners.map((partner) => (
            <Link
              key={partner.name}
              href={partner.href ?? "#"}
              className="flex h-20 items-center justify-center rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300"
            >
              <img src={partner.image} alt={partner.name} className="max-h-12 w-auto" loading="lazy" />
            </Link>
          ))}
        </div>

        <Link
          href="#"
          className="mt-10 inline-flex h-11 items-center rounded-md bg-[var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          View All Partners
        </Link>
      </div>
    </section>
  );
}
