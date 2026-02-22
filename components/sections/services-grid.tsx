import Link from "next/link";
import type { ServiceCatalogItem } from "@/lib/types";

type ServicesGridProps = {
  services: Array<
    Pick<ServiceCatalogItem, "id" | "slug" | "title" | "summary" | "category" | "imageUrl" | "amountKobo">
  >;
};

export function ServicesGrid({ services }: ServicesGridProps) {
  const formatNaira = (amountKobo: number | null) => {
    if (amountKobo === null) return "Price on request";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amountKobo / 100);
  };

  return (
    <section id="services" className="section-space bg-[var(--color-surface)]">
      <div className="site-container">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            What We Do
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl">
            Our Core Services
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="h-44 overflow-hidden">
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                    {service.category}
                  </span>
                  <span className="text-xs text-[var(--color-secondary)]">
                    {formatNaira(service.amountKobo)}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-semibold leading-snug text-[var(--color-primary)]">
                  {service.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{service.summary}</p>
                <Link
                  href={`/services/${service.slug}`}
                  className="mt-4 inline-flex text-sm font-semibold text-[var(--color-accent)] transition hover:underline"
                >
                  Read more -&gt;
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
