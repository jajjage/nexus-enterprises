import { subscribeToNewsletterAction } from "@/lib/subscribe-action";

export function NewsletterCta() {
  return (
    <section id="newsletter" className="section-space bg-[var(--color-surface)]">
      <div className="site-container">
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
          <h2 className="text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl">Stay Informed</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Subscribe to our newsletter for updates on regulatory changes, filing reminders, and
            practical insights for business growth.
          </p>

          <form
            className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:flex-row"
            action={subscribeToNewsletterAction}
          >
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="h-11 flex-1 rounded-md border border-slate-300 px-4 text-sm outline-none ring-[var(--color-primary)] transition focus:ring-2"
            />
            <button
              type="submit"
              className="h-11 rounded-md bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
