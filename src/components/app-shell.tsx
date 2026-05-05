import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/register", label: "Registration" },
  { href: "/tick", label: "Ticking Station" },
  { href: "/students", label: "Records" },
  { href: "/reports", label: "Daily Reports" },
];

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="app-shell">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="panel rounded-[28px] p-5 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-72 lg:flex-none">
          <div className="flex h-full flex-col gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-strong">
                CTBE CAFE
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-balance">
                  Smart meal tracking for campus service.
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Register students, verify meals instantly, and keep clean attendance records without physical cards.
                </p>
              </div>
            </div>

            <nav className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-muted transition hover:border-[var(--border)] hover:bg-white hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto rounded-[24px] bg-[linear-gradient(135deg,#1f1a17,#503423)] p-4 text-white">
              <p className="text-sm font-semibold">Daily workflow</p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Search by card number, confirm the face, then record Breakfast, Lunch, or Dinner in one tap.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <section className="panel rounded-[28px] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand">
                  Campus dining system
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
                  {title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{subtitle}</p>
              </div>
              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
          </section>

          {children}
        </main>
      </div>
    </div>
  );
}
