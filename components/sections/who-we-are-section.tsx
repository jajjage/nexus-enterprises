import Link from "next/link";
import type { TrustIndicator } from "@/lib/content";

type WhoWeAreSectionProps = {
  indicators: TrustIndicator[];
};

export function WhoWeAreSection({ indicators }: WhoWeAreSectionProps) {
  return (
    <section id="who-we-are" className="section-space bg-white">
      <div className="site-container grid items-stretch gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative min-h-[460px] overflow-hidden rounded-xl">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(20,40,80,0.65)] to-transparent" />
          <div className="absolute bottom-8 left-8 rounded-md border border-white/40 bg-white/15 px-5 py-3 text-sm font-semibold tracking-[0.15em] text-white backdrop-blur-sm">
            NEXUS ENTERPRISES
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl">Who We Are</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            We are a business consultancy focused on helping founders and organizations navigate
            CAC registration, tax compliance, and statutory filings with confidence. Our mission
            is to simplify regulatory processes through clear guidance, structured documentation,
            and dependable support from start to finish.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {indicators.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-lg border border-slate-200 p-4">
                <Icon className="h-5 w-5 text-[var(--color-accent)]" aria-hidden="true" />
                <h3 className="mt-3 text-base font-semibold text-[var(--color-primary)]">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#"
              className="inline-flex h-11 items-center rounded-md bg-[var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Learn More
            </Link>
            <Link
              href="#"
              className="inline-flex h-11 items-center rounded-md border border-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-slate-50"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
