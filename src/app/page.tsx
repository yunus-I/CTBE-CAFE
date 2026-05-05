import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { mealTypeLabels } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { createRecordDate, formatDisplayDate, getMealStatusMessage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
      title="Dashboard"
      subtitle="A single workspace for registration, live meal verification, and attendance history across the CTBE cafe system."
      actions={
        <>
          <Link
            href="/register"
            className="rounded-2xl bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-strong"
          >
            Register student
          </Link>
          <Link
            href="/tick"
            className="rounded-2xl border border-border bg-white px-5 py-3 font-semibold transition hover:border-brand"
          >
            Open ticking station
          </Link>
        </>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Registered students" value={String(studentCount)} hint="Total profiles in the system" />
            <StatCard label="Meals today" value={String(mealCountToday)} hint="Breakfast, lunch, and dinner combined" />
            <StatCard label="Last sync" value={formatDisplayDate(new Date())} hint="Live from the database" />
          </div>

          <div className="panel rounded-[28px] p-6">
            <p className="text-lg font-semibold">Today&apos;s service windows</p>
            <p className="mt-2 text-sm text-muted">{getMealStatusMessage()}</p>
            <div className="mt-4">
              <Link
                href="/reports"
                className="inline-flex rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold transition hover:border-brand"
              >
                Open daily reports
              </Link>
            </div>
          </div>

          <div className="panel rounded-[28px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">Recent meal activity</p>
                <p className="mt-1 text-sm text-muted">
                  Latest records coming in from the ticking station.
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
                        {meal.student.mealCardNumber} · {meal.student.department}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{mealTypeLabels[meal.mealType]}</p>
                      <p className="text-sm text-muted">{formatDisplayDate(meal.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="No meal activity yet. Start with student registration or open the ticking station." />
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="panel rounded-[28px] p-6">
            <p className="text-lg font-semibold">Newly registered students</p>
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
                      {student.department} · Year {student.year}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {student.mealCardNumber} · {student.aauId}
                    </p>
                  </Link>
                ))
              ) : (
                <EmptyState message="No students have been registered yet." />
              )}
            </div>
          </div>

          <div className="rounded-[28px] bg-[linear-gradient(135deg,#a24c22,#df8c4b)] p-6 text-white shadow-[var(--shadow)]">
            <p className="text-sm uppercase tracking-[0.24em] text-white/70">System target</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
              Fast check-in for thousands of students with strict duplicate prevention.
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/85">
              Every meal entry is constrained by student, meal type, and date so one person cannot be counted twice for the same meal.
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
