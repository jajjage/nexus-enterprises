"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import type { NavItem } from "@/lib/content";

type SiteHeaderProps = {
  navItems: NavItem[];
};

export function SiteHeader({ navItems }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="site-container flex h-20 items-center justify-between gap-4">
        <Link href="#" className="shrink-0" aria-label="Nexus Enterprises Home">
          <div className="rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-[var(--color-primary)]">
            NEXUS
          </div>
        </Link>

        <nav className="hidden items-center justify-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-700 transition hover:text-[var(--color-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-100"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link
            href="#"
            className="inline-flex h-10 items-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Register Business
          </Link>
          <Link
            href="#"
            className="inline-flex h-10 items-center rounded-md border border-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-slate-50"
          >
            Track Application
          </Link>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={`md:hidden ${
          open ? "max-h-[80vh] border-t border-slate-200" : "max-h-0"
        } overflow-hidden bg-white transition-all duration-300`}
      >
        <nav className="site-container flex flex-col py-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-[var(--color-primary)]"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 grid gap-2 pb-2">
            <Link
              href="#"
              className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
            >
              Register Business
            </Link>
            <Link
              href="#"
              className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary)]"
            >
              Track Application
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
