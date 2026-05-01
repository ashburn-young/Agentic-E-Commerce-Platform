import Link from "next/link";

import { StatusPanel } from "@/components/StatusPanel";
import { cn } from "@/components/ui";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-semibold tracking-tight">
              Azure Agentic Commerce
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink href="/shop">Shop</NavLink>
              <NavLink href="/ops">Ops</NavLink>
              <NavLink href="/dashboard">Dashboard</NavLink>
            </nav>
          </div>
          <div className="hidden md:block">
            <StatusPanel />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>

      <footer className="border-t border-black/5 py-8 text-sm text-zinc-500 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          Mock-first demo. No Azure credentials required.
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/5 hover:text-zinc-900",
        "dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white",
      )}
    >
      {children}
    </Link>
  );
}
