import Link from "next/link";
import { Prisma } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { StudentAvatar } from "@/components/student-avatar";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const search = q?.trim() ?? "";
  const where: Prisma.StudentWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { department: { contains: search, mode: "insensitive" } },
          { mealCardNumber: { contains: search } },
          { aauId: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const students = await prisma.student.findMany({
    where,
    include: {
      _count: {
        select: { mealRecords: true },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  return (
    <AppShell
      title="Student Records"
      subtitle="Browse all registered students, review their details, and open each profile for meal history."
    >
      <section className="panel rounded-[28px] p-6">
        <form className="mb-5">
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search by student name, department, card number, or AAU ID"
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-brand"
          />
        </form>

        <div className="grid gap-4">
          {students.length ? (
            students.map((student) => (
              <Link
                key={student.id}
                href={`/students/${student.id}`}
                className="flex flex-col gap-4 rounded-[24px] border border-border bg-white p-4 transition hover:border-brand md:flex-row md:items-center"
              >
                <StudentAvatar name={student.name} photoUrl={student.photoUrl} size="md" />
                <div className="grid flex-1 gap-2 md:grid-cols-4">
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-muted">{student.department}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">Card</p>
                    <p className="text-sm font-semibold">{student.mealCardNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">AAU ID</p>
                    <p className="text-sm font-semibold">{student.aauId}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">Meals recorded</p>
                    <p className="text-sm font-semibold">{student._count.mealRecords}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-sm text-muted">
              {search
                ? "No students matched that search."
                : "No students found yet. Use Registration to add the first profile."}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
