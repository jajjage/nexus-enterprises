"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BarChart3, BookOpen } from "lucide-react";
import { ADMIN_NAV } from "@/config/routes";

const navIcons = {
  Orders: BarChart3,
  Blog: BookOpen,
};

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-50">
      <nav className="space-y-1 p-4">
        {ADMIN_NAV.map((item) => {
          const Icon = navIcons[item.label as keyof typeof navIcons];
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-(--color-primary) text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-200"
              }`}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
