import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { mealTypes } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDisplayDate, parseDateInput } from "@/lib/utils";
import { Locale, getTranslation } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  const { date } = await params;
  const recordDate = parseDateInput(date);

  if (!recordDate) {
    notFound();
  }

  const [breakdown, records] = await Promise.all([
    prisma.mealRecord.groupBy({
      by: ["mealType"],
      where: { recordDate },
      _count: { _all: true },
    }),
    prisma.mealRecord.findMany({
      where: { recordDate },
      include: { student: true },
      orderBy: [{ mealType: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  if (!records.length) {
    notFound();
  }

  const counts = Object.fromEntries(mealTypes.map((m) => [m, 0])) as Record<string, number>;
  breakdown.forEach((entry) => { counts[entry.mealType] = entry._count._all; });
  const total = records.length;

  return (
    <AppShell
      title={`Report: ${formatDisplayDate(recordDate)}`}
      subtitle={t("mealAttendanceSummary")}
      actions={
        <Link href="/reports" className="btn-secondary">
          ← {t("backToDailyReports")}
        </Link>
      }
    >
      {/* Summary stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {mealTypes.map((mealType, idx) => (
          <div key={mealType} className="stat-card" style={{ borderTop: `3px solid ${idx % 2 === 0 ? "var(--brand)" : "var(--brand)"}` }}>
            <p className="stat-card-label">{t(mealType)}</p>
            <p className="stat-card-value" style={{ color: idx % 2 === 0 ? "var(--brand)" : "var(--brand)" }}>{counts[mealType]}</p>
          </div>
        ))}
        <div className="stat-card" style={{ borderTop: "3px solid var(--brand)", borderLeft: "none" }}>
          <p className="stat-card-label">{t("aggregatedTotal")}</p>
          <p className="stat-card-value" style={{ color: "var(--brand)" }}>{total}</p>
        </div>
      </div>

      {/* Records table */}
      <div className="panel" style={{ borderTop: "3px solid var(--brand)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-section-heading">{t("mealRecordsForDay")}</h2>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
            {total} meal records for {formatDisplayDate(recordDate)}
          </p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="aau-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Card No.</th>
                <th>AAU ID</th>
                <th>Meal Type</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, idx) => (
                <tr key={record.id}>
                  <td style={{ color: "var(--muted)", fontSize: "13px" }}>{idx + 1}</td>
                  <td style={{ fontWeight: 500 }}>{record.student.name}</td>
                  <td style={{ fontWeight: 600, fontSize: "13px" }}>{record.student.mealCardNumber}</td>
                  <td style={{ fontSize: "13px", fontFamily: "monospace", color: "var(--brand)" }}>
                    {record.student.aauId}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        record.mealType === "BREAKFAST"
                          ? "badge-warning"
                          : record.mealType === "LUNCH"
                          ? "badge-secondary"
                          : "badge-muted"
                      }`}
                    >
                      {getTranslation(locale, record.mealType as never)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
