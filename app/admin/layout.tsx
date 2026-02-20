import { auth } from "@/auth";
import { logoutAction } from "./login/actions";
import { LogOut } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      {/* Admin Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="site-container flex h-16 items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-primary)]">Nexus Admin</h1>
          </div>

          <div className="flex items-center gap-4">
            {session?.user && (
              <>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-slate-900">{session.user.name || session.user.email}</p>
                  <p className="text-xs text-slate-500">{session.user.email}</p>
                </div>

                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Admin Layout with Sidebar */}
      <div className="flex min-h-[calc(100vh-64px)] bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </>
  );
}
