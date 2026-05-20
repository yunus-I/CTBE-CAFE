import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { mealTypes } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateInput, formatDisplayDate } from "@/lib/utils";
import { Locale, getTranslation } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  const groupedDates = await prisma.mealRecord.groupBy({
    by: ["recordDate"],
    _count: {
      _all: true,
    },
    orderBy: {
      recordDate: "desc",
    },
  });

  const dateCards = await Promise.all(
    groupedDates.map(async (group) => {
      const breakdown = await prisma.mealRecord.groupBy({
        by: ["mealType"],
        where: {
          recordDate: group.recordDate,
        },
        _count: {
          _all: true,
        },
      });

      const counts = Object.fromEntries(
        mealTypes.map((mealType) => [mealType, 0]),
      ) as Record<(typeof mealTypes)[number], number>;

      breakdown.forEach((entry) => {
        counts[entry.mealType] = entry._count._all;
      });

      return {
        date: group.recordDate,
        total: group._count._all,
        counts,
      };
    }),
  );

  return (
    <AppShell
      title={t("dailyReports")}
      subtitle={t("reportsSubtitle")}
    >
      <section className="panel rounded-[28px] p-6">
        <div className="grid gap-4">
          {dateCards.length ? (
            dateCards.map((entry) => (
              <Link
                key={entry.date.toISOString()}
                href={`/reports/${formatDateInput(entry.date)}`}
                className="flex flex-col gap-4 rounded-[24px] border border-border bg-white p-5 transition hover:border-brand md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-lg font-semibold">{formatDisplayDate(entry.date)}</p>
                  <p className="mt-1 text-sm text-muted">
                    {t("totalMealsRecordText")}: {entry.total}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 md:min-w-[420px]">
                  {mealTypes.map((mealType) => (
                    <div key={mealType} className="rounded-2xl bg-[var(--surface)] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">
                        {getTranslation(locale, mealType)}
                      </p>
                      <p className="mt-1 text-lg font-semibold">{entry.counts[mealType]}</p>
                    </div>
                  ))}
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-sm text-muted">
              {t("noReportsAvailable")}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

