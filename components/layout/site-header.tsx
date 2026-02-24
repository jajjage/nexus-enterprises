"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/content";
import type { ServiceCatalogItem } from "@/lib/types";
import { CTA_BUTTONS } from "@/config/routes";

type SiteHeaderProps = {
  navItems: NavItem[];
  services: Array<Pick<ServiceCatalogItem, "id" | "slug" | "title">>;
};

type DesktopMenu = "services" | "register" | null;

export function SiteHeader({ navItems, services }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopMenu, setDesktopMenu] = useState<DesktopMenu>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileRegisterOpen, setMobileRegisterOpen] = useState(false);
  const closeDesktopMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasServices = services.length > 0;

  function closeMobileMenu() {
    setMobileOpen(false);
    setMobileServicesOpen(false);
    setMobileRegisterOpen(false);
  }

  function toggleDesktopMenu(menu: Exclude<DesktopMenu, null>) {
    setDesktopMenu((current) => (current === menu ? null : menu));
  }

  function openDesktopMenu(menu: Exclude<DesktopMenu, null>) {
    if (closeDesktopMenuTimer.current) {
      clearTimeout(closeDesktopMenuTimer.current);
      closeDesktopMenuTimer.current = null;
    }
    setDesktopMenu(menu);
  }

  function scheduleDesktopMenuClose() {
    if (closeDesktopMenuTimer.current) {
      clearTimeout(closeDesktopMenuTimer.current);
    }
    closeDesktopMenuTimer.current = setTimeout(() => {
      setDesktopMenu(null);
      closeDesktopMenuTimer.current = null;
    }, 160);
  }

  useEffect(() => {
    return () => {
      if (closeDesktopMenuTimer.current) {
        clearTimeout(closeDesktopMenuTimer.current);
      }
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="site-container flex h-20 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="Nexus Enterprises Home">
          <Image
            src="/logo2.png"
            alt="Nexus Enterprises"
            width={192}
            height={60}
            className="h-[60px] w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center justify-center gap-7 md:flex">
          {navItems.map((item) => {
            if (item.label === "Services") {
              if (!hasServices) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium text-slate-700 transition hover:text-(--color-primary)"
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => openDesktopMenu("services")}
                  onMouseLeave={scheduleDesktopMenuClose}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 transition hover:text-(--color-primary)"
                    onClick={() => toggleDesktopMenu("services")}
                  >
                    <span>Services</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        desktopMenu === "services" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute left-0 top-full mt-3 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl transition ${
                      desktopMenu === "services"
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-1 opacity-0"
                    }`}
                  >
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        href={`/services/${service.slug}`}
                        className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-(--color-primary)"
                        onClick={() => setDesktopMenu(null)}
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-700 transition hover:text-(--color-primary)"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-100"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {hasServices ? (
            <div
              className="relative"
              onMouseEnter={() => openDesktopMenu("register")}
              onMouseLeave={scheduleDesktopMenuClose}
            >
              <button
                type="button"
                className="inline-flex h-10 items-center gap-1 rounded-md bg-(--color-primary) px-4 text-sm font-semibold text-white transition hover:opacity-90"
                onClick={() => toggleDesktopMenu("register")}
              >
                <span>Register Business</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    desktopMenu === "register" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`absolute right-0 top-full mt-3 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl transition ${
                  desktopMenu === "register"
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-1 opacity-0"
                }`}
              >
                {services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}/checkout`}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-(--color-primary)"
                    onClick={() => setDesktopMenu(null)}
                  >
                    {service.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              href={CTA_BUTTONS.REGISTER_BUSINESS}
              className="inline-flex h-10 items-center rounded-md bg-(--color-primary) px-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Register Business
            </Link>
          )}

          <Link
            href={CTA_BUTTONS.TRACK_APPLICATION}
            className="inline-flex h-10 items-center rounded-md border border-(--color-primary) px-4 text-sm font-semibold text-(--color-primary) transition hover:bg-slate-50"
          >
            Track Application
          </Link>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={`md:hidden ${
          mobileOpen ? "max-h-[90vh] border-t border-slate-200" : "max-h-0"
        } overflow-hidden bg-white transition-all duration-300`}
      >
        <nav className="site-container flex flex-col py-4">
          {navItems.map((item) => {
            if (item.label === "Services" && hasServices) {
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => setMobileServicesOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-(--color-primary)"
                  >
                    <span>Services</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        mobileServicesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div className={`grid overflow-hidden transition-all ${mobileServicesOpen ? "max-h-80" : "max-h-0"}`}>
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        href={`/services/${service.slug}`}
                        onClick={closeMobileMenu}
                        className="ml-2 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-(--color-primary)"
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMobileMenu}
                className="rounded-md px-2 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-(--color-primary)"
              >
                {item.label}
              </Link>
            );
          })}

          <div className="mt-3 grid gap-2 pb-2">
            {hasServices ? (
              <div>
                <button
                  type="button"
                  onClick={() => setMobileRegisterOpen((prev) => !prev)}
                  className="flex h-11 w-full items-center justify-between rounded-md bg-(--color-primary) px-4 text-sm font-semibold text-white"
                >
                  <span>Register Business</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      mobileRegisterOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div className={`mt-2 grid overflow-hidden transition-all ${mobileRegisterOpen ? "max-h-96" : "max-h-0"}`}>
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}/checkout`}
                      onClick={closeMobileMenu}
                      className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-(--color-primary)"
                    >
                      {service.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                href={CTA_BUTTONS.REGISTER_BUSINESS}
                onClick={closeMobileMenu}
                className="inline-flex h-11 items-center justify-center rounded-md bg-(--color-primary) px-4 text-sm font-semibold text-white"
              >
                Register Business
              </Link>
            )}

            <Link
              href={CTA_BUTTONS.TRACK_APPLICATION}
              onClick={closeMobileMenu}
              className="inline-flex h-11 items-center justify-center rounded-md border border-(--color-primary) px-4 text-sm font-semibold text-(--color-primary)"
            >
              Track Application
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
