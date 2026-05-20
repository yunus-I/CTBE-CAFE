import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { prisma } from "@/lib/db";
import { createRecordDate, formatDisplayDate, getMealStatusMessage } from "@/lib/utils";
import { Locale, getTranslation, getTranslationOrSelf } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  const [studentCount, mealCountToday, recentStudents, recentMeals] =
    await Promise.all([
      prisma.student.count(),
      prisma.mealRecord.count({
        where: {
          recordDate: createRecordDate(),
        },
      }),
      prisma.student.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.mealRecord.findMany({
        include: { student: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  return (
    <AppShell
      title={t("dashboard")}
      subtitle={t("dashboardSubtitle")}
      actions={
        <>
          <Link
            href="/register"
            className="rounded-2xl bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-strong"
          >
            {t("registerStudentBtn")}
          </Link>
          <Link
            href="/tick"
            className="rounded-2xl border border-border bg-white px-5 py-3 font-semibold transition hover:border-brand"
          >
            {t("openTickingStationBtn")}
          </Link>
        </>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label={t("registeredStudents")} value={String(studentCount)} hint={t("totalProfiles")} />
            <StatCard label={t("mealsToday")} value={String(mealCountToday)} hint={t("combinedMealsHint")} />
            <StatCard label={t("lastSync")} value={formatDisplayDate(new Date())} hint={t("liveDbHint")} />
          </div>

          <div className="panel rounded-[28px] p-6">
            <p className="text-lg font-semibold">{t("todaysServiceWindows")}</p>
            <p className="mt-2 text-sm text-muted">{getMealStatusMessage(new Date(), locale)}</p>
            <div className="mt-4">
              <Link
                href="/reports"
                className="inline-flex rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold transition hover:border-brand"
              >
                {t("openDailyReportsBtn")}
              </Link>
            </div>
          </div>

          <div className="panel rounded-[28px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{t("recentMealActivity")}</p>
                <p className="mt-1 text-sm text-muted">
                  {t("tickingStationLiveHint")}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {recentMeals.length ? (
                recentMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-white px-4 py-4"
                  >
                    <div>
                      <p className="font-semibold">{meal.student.name}</p>
                      <p className="text-sm text-muted">
                        {meal.student.mealCardNumber} · {getTranslationOrSelf(locale, meal.student.department)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{getTranslation(locale, meal.mealType as never)}</p>
                      <p className="text-sm text-muted">{formatDisplayDate(meal.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message={t("noMealActivity")} />
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="panel rounded-[28px] p-6">
            <p className="text-lg font-semibold">{t("newlyRegisteredStudents")}</p>
            <div className="mt-5 grid gap-3">
              {recentStudents.length ? (
                recentStudents.map((student) => (
                  <Link
                    key={student.id}
                    href={`/students/${student.id}`}
                    className="rounded-2xl border border-border bg-white px-4 py-4 transition hover:border-brand"
                  >
                    <p className="font-semibold">{student.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {getTranslationOrSelf(locale, student.department)} · {locale === "am" ? "ዓመት" : "Year"} {student.year}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {student.mealCardNumber} · {student.aauId}
                    </p>
                  </Link>
                ))
              ) : (
                <EmptyState message={t("noStudentsRegisteredYet")} />
              )}
            </div>
          </div>

          <div className="rounded-[28px] bg-[linear-gradient(135deg,#a24c22,#df8c4b)] p-6 text-white shadow-[var(--shadow)]">
            <p className="text-sm uppercase tracking-[0.24em] text-white/70">{t("systemTarget")}</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
              {t("systemTargetTitle")}
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/85">
              {t("systemTargetDesc")}
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="panel rounded-[24px] p-5">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-muted">{hint}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted">
      {message}
    </div>
  );
}

