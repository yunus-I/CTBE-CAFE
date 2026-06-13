"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useTranslation } from "@/components/locale-context";
import { TranslationKey } from "@/lib/translations";

/* -----------------------------------------------
   Navigation tree definition
----------------------------------------------- */
type NavItem = {
  href: string;
  labelKey: TranslationKey;
  icon: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Main Station",
    items: [
      { href: "/", labelKey: "dashboard", icon: "⊞" },
      { href: "/tick", labelKey: "tickingStation", icon: "✓" },
    ],
  },
  {
    label: "Student Administration",
    items: [
      { href: "/register", labelKey: "registration", icon: "＋" },
      { href: "/students", labelKey: "records", icon: "☰" },
    ],
  },
  {
    label: "Cafe Administration",
    items: [
      { href: "/menu", labelKey: "menuManagement", icon: "◉" },
      { href: "/schedule", labelKey: "mealScheduling", icon: "▦" },
    ],
  },
  {
    label: "Attendance & Reporting",
    items: [
      { href: "/reports", labelKey: "dailyReports", icon: "📄" },
    ],
  },
];

/* -----------------------------------------------
   Top Navbar
----------------------------------------------- */
function TopNavbar({ locale, setLocale }: { locale: string; setLocale: (l: "en" | "am") => void }) {
  return (
    <header className="top-navbar">
    <div style={{ display: "flex", gap: "0px", alignItems: "center" }}>
        {/* Left: Logo + Title */}
        <div style={{ fontWeight: 700, fontSize: "13px", letterSpacing: "0.5px", color: "rgba(255,255,255,0.6)", marginRight: "6px", flexShrink: 0 }}>
        </div>
        <div className="flex items-center gap-3 flex-1">
        <img
          src="/logo.jpg"
          alt="Addis Ababa University Logo"
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid rgba(255,255,255,0.4)",
            background: "#fff",
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px", lineHeight: 1.1 }}>
            Addis Ababa University
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px", fontWeight: 400, letterSpacing: "0.3px" }}>
            Cafe Management System
          </div>
        </div>
      </div>
    </div>

      {/* Right: User info + Language toggle */}
      <div className="flex items-center gap-4">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b7bbc" }} />
          <span style={{ color: "rgba(255,255,255,0.80)", fontSize: "13px" }}>
            Admin
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "2px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "4px",
            padding: "2px",
          }}
        >
          <button
            onClick={() => setLocale("en")}
            style={{
              padding: "3px 10px",
              borderRadius: "3px",
              border: "none",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              background: locale === "en" ? "#fff" : "transparent",
              color: locale === "en" ? "var(--brand)" : "rgba(255,255,255,0.85)",
              transition: "all 0.15s",
            }}
          >
            EN
          </button>
          <button
            onClick={() => setLocale("am")}
            style={{
              padding: "3px 10px",
              borderRadius: "3px",
              border: "none",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              background: locale === "am" ? "#fff" : "transparent",
              color: locale === "am" ? "var(--brand)" : "rgba(255,255,255,0.85)",
              transition: "all 0.15s",
            }}
          >
            አማ
          </button>
        </div>
      </div>
    </header>
  );
}

/* -----------------------------------------------
   Sidebar
----------------------------------------------- */
function Sidebar({ pathname }: { pathname: string }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { t } = useTranslation();

  function toggleGroup(label: string) {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="sidebar" style={{ borderTop: "3px solid var(--brand)" }}>
      <nav style={{ paddingTop: "8px", paddingBottom: "16px" }}>
        {navGroups.map((group) => {
          const isCollapsed = collapsed[group.label];
          return (
            <div key={group.label}>
              {/* Group label */}
              <button
                onClick={() => toggleGroup(group.label)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "10px 16px 4px",
                  textAlign: "left",
                }}
              >
                <span className="sidebar-group-label" style={{ padding: 0 }}>
                  {group.label}
                </span>
                <span style={{ fontSize: "10px", color: "var(--muted)", paddingRight: "4px" }}>
                  {isCollapsed ? "▶" : "▼"}
                </span>
              </button>

              {/* Nav items */}
              {!isCollapsed &&
                group.items.map((item) => {
                  const active = isActive(item.href);
                  let label: string;
                  try {
                    label = t(item.labelKey);
                  } catch {
                    label = item.href.slice(1).replace(/^./, (c) => c.toUpperCase());
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-nav-item${active ? " active" : ""}`}
                    >
                      <span style={{ fontSize: "15px", width: "20px", textAlign: "center", flexShrink: 0 }}>
                        {item.icon}
                      </span>
                      <span>{label}</span>
                    </Link>
                  );
                })}
            </div>
          );
        })}
      </nav>

      {/* Bottom spacer */}
      <div style={{ flex: 1 }} />
    </aside>
  );
}

/* -----------------------------------------------
   Footer
----------------------------------------------- */
function Footer() {
  return (
    <footer
      style={{
        background: "var(--brand)",
        color: "#ffffff",
        textAlign: "center",
        fontSize: "13px",
        padding: "12px 24px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      © Addis Ababa University — Cafe Management System
    </footer>
  );
}

/* -----------------------------------------------
   Page Header (title + subtitle + actions)
----------------------------------------------- */
function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ borderLeft: "4px solid var(--brand)", paddingLeft: "12px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--brand)", marginBottom: "4px" }}>
          Campus Cafe System
        </p>
        <h1 className="text-page-title">{title}</h1>
        {subtitle && (
          <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--muted)", maxWidth: "640px" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {actions}
        </div>
      )}
    </div>
  );
}

/* -----------------------------------------------
   AppShell (main export)
----------------------------------------------- */
export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const pathname = usePathname();
  const { locale, setLocale } = useTranslation();

  return (
    <div className="app-shell" style={{ display: "flex", flexDirection: "column" }}>
      {/* Sticky Top Navbar */}
      <TopNavbar locale={locale} setLocale={setLocale} />

      {/* Body: Sidebar + Content */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Sidebar pathname={pathname} />

        {/* Main Area */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <main className="main-content" style={{ flex: 1 }}>
            <Breadcrumbs />
            <PageHeader title={title} subtitle={subtitle} actions={actions} />
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
