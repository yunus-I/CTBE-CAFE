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
    student.mealRecords.reduce<Record<string, typeof student.mealRecords>>((accumulator, record) => {
      const key = formatDateInput(record.recordDate);
      accumulator[key] ??= [];
      accumulator[key].push(record);
      return accumulator;
    }, {}),
  );

  return (
    <AppShell
      title={student.name}
      subtitle={t("studentProfileSubtitle")}
      actions={
        <Link
          href="/students"
          className="rounded-2xl border border-border bg-white px-5 py-3 font-semibold transition hover:border-brand"
        >
          {t("backToRecords")}
        </Link>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="panel rounded-[28px] p-6">
          <div className="flex flex-col items-start gap-5">
            <StudentAvatar name={student.name} photoUrl={student.photoUrl} size="lg" />
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Detail label={t("department")} value={getTranslationOrSelf(locale, student.department)} />
              <Detail label={t("year")} value={locale === "am" ? `ዓመት ${student.year}` : `Year ${student.year}`} />
              <Detail label={t("mealCardNumber")} value={student.mealCardNumber} />
              <Detail label={t("aauId")} value={student.aauId} />
              <Detail label={t("createdLabel")} value={formatDisplayDate(student.createdAt)} />
              <Detail label={t("mealsRecordedLabel")} value={String(student.mealRecords.length)} />
            </div>
          </div>
        </div>

        <div className="panel rounded-[28px] p-6">
          <p className="text-lg font-semibold">{t("mealHistoryLabel")}</p>
          <div className="mt-5 grid gap-4">
            {groupedMeals.length ? (
              groupedMeals.map(([date, records]) => (
                <div key={date} className="rounded-[24px] border border-border bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold">{formatDisplayDate(date)}</p>
                    <span className="text-sm text-muted">{records.length} {t("mealCountSuffix")}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-strong"
                      >
                        {getTranslation(locale, record.mealType as never)}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-sm text-muted">
                {t("noMealRecordsYet")}
              </div>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

