import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrencyNaira } from "@/lib/format";
import { getPublishedServiceBySlug } from "@/lib/services";

export default async function ServiceInfoPage({
  params,
}: {
  params: Promise<{ "service-slug": string }>;
}) {
  const { "service-slug": serviceSlug } = await params;
  const service = await getPublishedServiceBySlug(serviceSlug);

  if (!service) {
    notFound();
  }

  return (
    <main className="section-space bg-slate-50">
      <div className="site-container space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--color-secondary)">
              What We Do
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-(--color-primary) sm:text-4xl">
              {service.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex rounded-full bg-(--color-primary)/10 px-3 py-1 font-semibold text-(--color-primary)">
                {service.category}
              </span>
              <span className="font-medium text-slate-600">
                {formatCurrencyNaira(service.amountKobo)}
              </span>
            </div>
            <p className="mt-6 text-base leading-7 text-slate-700">{service.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {service.amountKobo && service.amountKobo > 0 ? (
                <Link
                  href={`/services/${service.slug}/checkout`}
                  className="inline-flex h-11 items-center rounded-md bg-(--color-primary) px-5 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Proceed to Payment
                </Link>
              ) : (
                <span className="inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600">
                  Pricing will be available soon.
                </span>
              )}
              <Link
                href="/#services"
                className="inline-flex h-11 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Back to Services
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="h-64 w-full">
              <img
                src={service.imageUrl}
                alt={service.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2 p-5">
              <h2 className="text-lg font-semibold text-(--color-primary)">Service Overview</h2>
              <p className="text-sm leading-6 text-slate-600">{service.summary}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
