import Link from "next/link";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { StudentAvatar } from "@/components/student-avatar";
import { prisma } from "@/lib/db";
import { Locale, getTranslation, getTranslationOrSelf } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

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
      title={t("records")}
      subtitle={t("recordsSubtitle")}
    >
      <section className="panel rounded-[28px] p-6">
        <form className="mb-5">
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder={t("searchPlaceholder")}
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
                    <p className="text-sm text-muted">{getTranslationOrSelf(locale, student.department)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">{t("cardLabel")}</p>
                    <p className="text-sm font-semibold">{student.mealCardNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">{t("aauId")}</p>
                    <p className="text-sm font-semibold">{student.aauId}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">{t("mealsRecordedLabel")}</p>
                    <p className="text-sm font-semibold">{student._count.mealRecords}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-sm text-muted">
              {search
                ? t("noStudentsMatched")
                : t("noStudentsFoundYet")}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

