import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { StudentAvatar } from "@/components/student-avatar";
import { prisma } from "@/lib/db";
import { formatDateInput, formatDisplayDate } from "@/lib/utils";
import { Locale, getTranslation, getTranslationOrSelf } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      mealRecords: {
        orderBy: [{ recordDate: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!student) {
    notFound();
  }

  const groupedMeals = Object.entries(
    student.mealRecords.reduce<Record<string, typeof student.mealRecords>>((acc, record) => {
      const key = formatDateInput(record.recordDate);
      acc[key] ??= [];
      acc[key].push(record);
      return acc;
    }, {}),
  );

  return (
    <AppShell
      title={student.name}
      subtitle={t("studentProfileSubtitle")}
      actions={
        <Link href="/students" className="btn-secondary">
          ← {t("backToRecords")}
        </Link>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "20px", alignItems: "start" }}>
        {/* Student Info Card */}
        <div className="panel">
          <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              background: "var(--brand-soft)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <StudentAvatar name={student.name} photoUrl={student.photoUrl} size="lg" />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 700, fontSize: "16px", color: "var(--brand)" }}>{student.name}</p>
              <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
                {getTranslationOrSelf(locale, student.department)}
              </p>
            </div>
            <span className="badge badge-success">Active</span>
          </div>

          <div style={{ padding: "0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  { label: t("aauId"), value: student.aauId },
                  { label: t("mealCardNumber"), value: student.mealCardNumber },
                  { label: t("year"), value: locale === "am" ? `ዓመት ${student.year}` : `Year ${student.year}` },
                  { label: t("createdLabel"), value: formatDisplayDate(student.createdAt) },
                  { label: t("mealsRecordedLabel"), value: String(student.mealRecords.length) },
                ].map(({ label, value }) => (
                  <tr key={label} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 16px", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)", width: "50%" }}>
                      {label}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "14px", fontWeight: 500, color: "var(--foreground)" }}>
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Meal History */}
        <div className="panel">
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-section-heading">{t("mealHistoryLabel")}</h2>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
              {student.mealRecords.length} {t("mealCountSuffix")} total
            </p>
          </div>

          {groupedMeals.length ? (
            <div style={{ overflowX: "auto" }}>
              <table className="aau-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Meals Consumed</th>
                    <th style={{ textAlign: "center" }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedMeals.map(([date, records]) => (
                    <tr key={date}>
                      <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                        {formatDisplayDate(date)}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {records.map((record) => (
                            <span key={record.id} className="badge badge-secondary" style={{ fontSize: "12px" }}>
                              {getTranslation(locale, record.mealType as never)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 600 }}>{records.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "24px" }}>
              <div className="empty-state">{t("noMealRecordsYet")}</div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
