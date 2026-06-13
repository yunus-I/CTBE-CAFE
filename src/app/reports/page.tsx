import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { mealTypes } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateInput, formatDisplayDate } from "@/lib/utils";
import { Locale, getTranslation } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ meal?: string }>;
}) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  const { meal } = await searchParams;
  const mealFilter = mealTypes.includes(meal as (typeof mealTypes)[number])
    ? (meal as (typeof mealTypes)[number])
    : null;

  const groupedDates = await prisma.mealRecord.groupBy({
    by: ["recordDate"],
    ...(mealFilter ? { where: { mealType: mealFilter } } : {}),
    _count: { _all: true },
    orderBy: { recordDate: "desc" },
  });

  const dateCards = await Promise.all(
    groupedDates.map(async (group) => {
      const breakdown = await prisma.mealRecord.groupBy({
        by: ["mealType"],
        where: { recordDate: group.recordDate },
        _count: { _all: true },
      });
      const counts = Object.fromEntries(mealTypes.map((m) => [m, 0])) as Record<string, number>;
      breakdown.forEach((e) => { counts[e.mealType] = e._count._all; });
      return { date: group.recordDate, total: group._count._all, counts };
    }),
  );

  const grandTotal = dateCards.reduce((s, r) => s + r.total, 0);

  return (
    <AppShell
      title={t("dailyReports")}
      subtitle={t("reportsSubtitle")}
    >
      <div className="panel" style={{ borderTop: "3px solid var(--brand)" }}>
        {/* Filter bar */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span className="form-label" style={{ marginBottom: 0 }}>Filter by meal:</span>
          {[{ label: "All", value: "" }, ...mealTypes.map((m) => ({ label: t(m), value: m }))].map(
            (opt) => (
              <Link
                key={opt.value}
                href={opt.value ? `/reports?meal=${opt.value}` : "/reports"}
                style={{
                  padding: "5px 14px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: "1px solid",
                  borderColor: (mealFilter ?? "") === opt.value ? "var(--brand)" : "var(--border)",
                  background: (mealFilter ?? "") === opt.value ? "var(--brand)" : "#fff",
                  color: (mealFilter ?? "") === opt.value ? "#fff" : "var(--foreground)",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                {opt.label}
              </Link>
            ),
          )}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            {dateCards.length} report{dateCards.length !== 1 ? "s" : ""} · {grandTotal} total meals
          </span>
        </div>

        {/* Table */}
        {dateCards.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="aau-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Breakfast</th>
                  <th>Lunch</th>
                  <th>Dinner</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dateCards.map((entry, idx) => (
                  <tr key={entry.date.toISOString()}>
                    <td style={{ color: "var(--muted)", fontSize: "13px" }}>{idx + 1}</td>
                    <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{formatDisplayDate(entry.date)}</td>
                    <td>{entry.counts.BREAKFAST}</td>
                    <td>{entry.counts.LUNCH}</td>
                    <td>{entry.counts.DINNER}</td>
                    <td style={{ fontWeight: 700, color: "var(--brand)" }}>{entry.total}</td>
                    <td>
                      <Link
                        href={`/reports/${formatDateInput(entry.date)}`}
                        style={{ color: "var(--brand)", fontSize: "13px", fontWeight: 500 }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#F9F9F9", fontWeight: 600 }}>
                  <td colSpan={2} style={{ padding: "10px 14px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)" }}>
                    Grand Total
                  </td>
                  <td style={{ padding: "10px 14px" }}>{dateCards.reduce((s, r) => s + r.counts.BREAKFAST, 0)}</td>
                  <td style={{ padding: "10px 14px" }}>{dateCards.reduce((s, r) => s + r.counts.LUNCH, 0)}</td>
                  <td style={{ padding: "10px 14px" }}>{dateCards.reduce((s, r) => s + r.counts.DINNER, 0)}</td>
                  <td style={{ padding: "10px 14px", color: "var(--brand)", fontWeight: 700 }}>{grandTotal}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div style={{ padding: "24px" }}>
            <div className="empty-state">{t("noReportsAvailable")}</div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
