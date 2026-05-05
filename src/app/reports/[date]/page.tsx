import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { mealTypeLabels, mealTypes } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDisplayDate, parseDateInput } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const recordDate = parseDateInput(date);

  if (!recordDate) {
    notFound();
  }

  const [breakdown, records] = await Promise.all([
    prisma.mealRecord.groupBy({
      by: ["mealType"],
      where: {
        recordDate,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.mealRecord.findMany({
      where: {
        recordDate,
      },
      include: {
        student: true,
      },
      orderBy: [{ mealType: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  if (!records.length) {
    notFound();
  }

  const counts = Object.fromEntries(
    mealTypes.map((mealType) => [mealType, 0]),
  ) as Record<(typeof mealTypes)[number], number>;

  breakdown.forEach((entry) => {
    counts[entry.mealType] = entry._count._all;
  });

  const total = records.length;

  return (
    <AppShell
      title={formatDisplayDate(recordDate)}
      subtitle="Meal attendance summary for the selected date."
      actions={
        <Link
          href="/reports"
          className="rounded-2xl border border-border bg-white px-5 py-3 font-semibold transition hover:border-brand"
        >
          Back to daily reports
        </Link>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-4">
          {mealTypes.map((mealType) => (
            <SummaryCard
              key={mealType}
              label={mealTypeLabels[mealType]}
              value={counts[mealType]}
            />
          ))}
          <SummaryCard label="Aggregated total" value={total} />
        </div>

        <div className="panel rounded-[28px] p-6">
          <p className="text-lg font-semibold">Meal records for the day</p>
          <div className="mt-5 grid gap-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-white px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">{record.student.name}</p>
                  <p className="text-sm text-muted">
                    {record.student.mealCardNumber} · {record.student.aauId}
                  </p>
                </div>
                <div className="text-sm font-semibold text-brand">
                  {mealTypeLabels[record.mealType]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel rounded-[24px] p-5">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
