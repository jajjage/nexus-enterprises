import { loginAction } from "./actions";
import { FileText, Lock, ShieldCheck } from "lucide-react";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const errorCode = params.error?.trim() ?? "";
  const hasError = Boolean(errorCode);
  const errorText =
    errorCode === "invalid_credentials"
      ? "Invalid email or password."
      : errorCode === "server_error"
        ? "An error occurred. Please try again."
        : "Unable to sign in.";

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,40,80,0.85),_rgba(15,23,42,1)_55%)]" />
      <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--color-accent)]/20 blur-3xl" />

      <div className="site-container relative flex min-h-screen items-center py-10">
        <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="hidden rounded-3xl border border-white/15 bg-white/5 p-8 text-slate-100 shadow-2xl backdrop-blur-sm lg:block">
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-200">
              Nexus Admin Portal
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">
              Manage orders, services, and blog operations in one secured workspace.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
              Access is restricted to authorized team members handling CAC filings, tax compliance,
              and client communications.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/30 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-sm font-semibold text-white">Protected Access</p>
                  <p className="text-xs text-slate-300">Role-restricted admin authentication.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/30 p-4">
                <FileText className="mt-0.5 h-5 w-5 text-sky-300" />
                <div>
                  <p className="text-sm font-semibold text-white">Live Order Visibility</p>
                  <p className="text-xs text-slate-300">Update timeline events and status instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/30 p-4">
                <Lock className="mt-0.5 h-5 w-5 text-rose-300" />
                <div>
                  <p className="text-sm font-semibold text-white">Secure Session</p>
                  <p className="text-xs text-slate-300">JWT-based session with encrypted cookies.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-secondary)]">
              Welcome Back
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-[var(--color-primary)]">Admin Login</h2>
            <p className="mt-2 text-sm text-slate-600">Sign in to access the operations dashboard.</p>

            {hasError ? (
              <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {errorText}
              </p>
            ) : null}

            <form action={loginAction} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                  placeholder="admin@company.com"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)]/90"
              >
                Sign In
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
