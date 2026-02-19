import { subscribeToNewsletterAction } from "@/lib/subscribe-action";

export function SubscribeCard() {
  return (
    <form action={subscribeToNewsletterAction} className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-[var(--color-surface)] p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">Newsletter</p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--color-primary)]">Subscribe to updates</h3>
        <p className="mt-2 text-sm text-slate-600">Get new posts and compliance updates directly.</p>
      </div>
      <div className="mt-4 space-y-2">
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
        />
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
        >
          Subscribe
        </button>
      </div>
    </form>
  );
}
