import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { prisma } from "@/lib/db";
import { createRecordDate, formatDisplayDate, getMealStatusMessage } from "@/lib/utils";
import { Locale, getTranslation, getTranslationOrSelf } from "@/lib/translations";
import { mealTypes } from "@/lib/constants";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  const today = createRecordDate();

  const [studentCount, mealCountToday, recentMeals] = await Promise.all([
    prisma.student.count(),
    prisma.mealRecord.count({ where: { recordDate: today } }),
    prisma.mealRecord.findMany({
      include: { student: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Build last-7-days breakdown for weekly table
  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    return d;
  });

  const weeklyRows = await Promise.all(
    last7Dates.map(async (date) => {
      const breakdown = await prisma.mealRecord.groupBy({
        by: ["mealType"],
        where: { recordDate: date },
        _count: { _all: true },
      });
      const counts = Object.fromEntries(mealTypes.map((m) => [m, 0])) as Record<string, number>;
      breakdown.forEach((b) => { counts[b.mealType] = b._count._all; });
      const total = Object.values(counts).reduce((s, v) => s + v, 0);
      return { date, counts, total };
    }),
  );

  const mealStatusMessage = getMealStatusMessage(new Date(), locale);

  return (
    <AppShell
      title={t("dashboard")}
      subtitle={t("dashboardSubtitle")}
      actions={
        <>
          <Link href="/register" className="btn-primary">
            {t("registerStudentBtn")}
          </Link>
          <Link href="/tick" className="btn-secondary">
            {t("openTickingStationBtn")}
          </Link>
        </>
      }
    >
      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard label={t("registeredStudents")} value={studentCount.toLocaleString()} hint={t("totalProfiles")} color="brand" />
        <StatCard label={t("mealsToday")} value={mealCountToday.toLocaleString()} hint={t("combinedMealsHint")} color="blue" />
        <StatCard label="Revenue (Est.)" value={`${(mealCountToday * 15).toLocaleString()} Birr`} hint="Based on 15 Birr/meal" color="brand" />
        <StatCard label={t("lastSync")} value={formatDisplayDate(new Date())} hint={t("liveDbHint")} color="blue" />
      </div>

      {/* Meal Status Banner */}
      <div
        className="panel"
        style={{ padding: "14px 20px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}
      >
        <p style={{ fontSize: "14px", color: "var(--foreground)" }}>{mealStatusMessage}</p>
        <Link href="/reports" className="btn-secondary" style={{ padding: "6px 16px", fontSize: "13px" }}>
          {t("openDailyReportsBtn")}
        </Link>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }}>
        {/* Weekly Meal Summary */}
        <div className="panel">
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-section-heading" style={{ color: "var(--brand)" }}>7-Day Meal Summary</h2>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>Meals served over the last 7 days</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="aau-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Breakfast</th>
                  <th>Lunch</th>
                  <th>Dinner</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {weeklyRows.map((row) => (
                  <tr key={row.date.toISOString()}>
                    <td style={{ fontWeight: 500 }}>{formatDisplayDate(row.date)}</td>
                    <td>{row.counts.BREAKFAST}</td>
                    <td>{row.counts.LUNCH}</td>
                    <td>{row.counts.DINNER}</td>
                    <td style={{ fontWeight: 600, color: "var(--brand)" }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="panel">
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-section-heading" style={{ color: "var(--brand)" }}>{t("recentMealActivity")}</h2>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>{t("tickingStationLiveHint")}</p>
          </div>
          {recentMeals.length ? (
            <div style={{ padding: "8px 0" }}>
              {recentMeals.map((meal) => (
                <div
                  key={meal.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 20px",
                    borderBottom: "1px solid var(--border)",
                    gap: "12px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {meal.student.name}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--muted)" }}>
                      Card {meal.student.mealCardNumber} · {getTranslationOrSelf(locale, meal.student.department)}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span className="badge badge-secondary" style={{ fontSize: "11px" }}>
                      {getTranslation(locale, meal.mealType as never)}
                    </span>
                    <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "3px" }}>
                      {formatDisplayDate(meal.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "32px 20px" }} className="empty-state">
              {t("noMealActivity")}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, hint, color = "brand" }: { label: string; value: string; hint: string; color?: "brand" | "blue" }) {
  const valueColor = color === "blue" ? "var(--brand)" : "var(--brand)";
  const borderColor = color === "blue" ? "var(--brand)" : "var(--brand)";
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${borderColor}` }}>
      <p className="stat-card-label">{label}</p>
      <p className="stat-card-value" style={{ color: valueColor }}>{value}</p>
      <p className="stat-card-hint">{hint}</p>
    </div>
  );
}
