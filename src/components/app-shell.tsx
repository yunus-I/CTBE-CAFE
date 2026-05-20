"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useTranslation } from "@/components/locale-context";
import { TranslationKey } from "@/lib/translations";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/register", label: "Registration" },
  { href: "/tick", label: "Ticking Station" },
  { href: "/students", label: "Records" },
  { href: "/reports", label: "Daily Reports" },
];

const navItemKeys: Record<string, TranslationKey> = {
  "/": "dashboard",
  "/register": "registration",
  "/tick": "tickingStation",
  "/students": "records",
  "/reports": "dailyReports",
};

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
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="app-shell">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="panel rounded-[28px] p-5 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-80 lg:flex-none">
          <div className="flex h-full flex-col gap-6">
            
            {/* Header with Logo and Language Toggle */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.jpg"
                  alt="Addis Ababa University CTBE Logo"
                  className="h-12 w-12 rounded-full border border-border shadow-sm object-cover bg-white"
                />
                <div>
                  <div className="inline-flex items-center rounded-full bg-brand-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-strong">
                    {t("brandName")}
                  </div>
                  <h2 className="text-[10px] font-semibold text-muted tracking-wider mt-0.5 uppercase">
                    AAU - CTBE
                  </h2>
                </div>
              </div>
              
              <div className="flex items-center gap-0.5 bg-[var(--surface)] p-0.5 rounded-lg border border-border/80">
                <button
                  onClick={() => setLocale("en")}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all ${
                    locale === "en"
                      ? "bg-brand text-white shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-white/50"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLocale("am")}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all ${
                    locale === "am"
                      ? "bg-brand text-white shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-white/50"
                  }`}
                >
                  አማ
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-balance">
                  {t("slogan")}
                </h1>
                <p className="mt-2 text-xs leading-5 text-muted">
                  {t("introText")}
                </p>
              </div>
            </div>

            <nav className="grid gap-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-transparent px-4 py-2.5 text-sm font-medium text-muted transition hover:border-[var(--border)] hover:bg-white hover:text-foreground"
                >
                  {t(navItemKeys[item.href])}
                </Link>
              ))}
            </nav>

            <div className="mt-auto rounded-[24px] bg-[linear-gradient(135deg,#1f1a17,#503423)] p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider">{t("dailyWorkflow")}</p>
              <p className="mt-2 text-xs leading-5 text-white/75">
                {t("workflowHelp")}
              </p>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <section className="panel rounded-[28px] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-brand">
                  {t("campusDiningSystem")}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance">
                  {title}
                </h2>
                <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">{subtitle}</p>
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

