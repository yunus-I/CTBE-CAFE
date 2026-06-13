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
      _count: { select: { mealRecords: true } },
    },
    orderBy: [{ name: "asc" }],
  });

  return (
    <AppShell
      title={t("records")}
      subtitle={t("recordsSubtitle")}
      actions={
        <Link href="/register" className="btn-primary">
          {t("registerStudentBtn")}
        </Link>
      }
    >
      <div className="panel" style={{ borderTop: "3px solid var(--brand)" }}>
        {/* Search bar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: "12px", alignItems: "center" }}>
          <form style={{ flex: 1 }}>
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder={t("searchPlaceholder")}
              className="form-input"
              style={{ maxWidth: "480px" }}
            />
          </form>
          <span style={{ fontSize: "13px", color: "var(--muted)", whiteSpace: "nowrap" }}>
            {students.length} student{students.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        {students.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="aau-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Student</th>
                  <th>AAU ID</th>
                  <th>Card No.</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Meal Plan</th>
                  <th>Status</th>
                  <th>Meals</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id}>
                    <td style={{ color: "var(--muted)", fontSize: "13px" }}>{index + 1}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <StudentAvatar name={student.name} photoUrl={student.photoUrl} size="sm" />
                        <span style={{ fontWeight: 500 }}>{student.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: "13px", fontFamily: "monospace", color: "var(--brand)" }}>
                      {student.aauId}
                    </td>
                    <td style={{ fontSize: "13px", fontWeight: 600 }}>{student.mealCardNumber}</td>
                    <td style={{ fontSize: "13px" }}>{getTranslationOrSelf(locale, student.department)}</td>
                    <td style={{ fontSize: "13px", textAlign: "center" }}>{student.year}</td>
                    <td>
                      <span className="badge badge-secondary">Regular (UGR)</span>
                    </td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{student._count.mealRecords}</td>
                    <td>
                      <Link
                        href={`/students/${student.id}`}
                        style={{ color: "var(--brand)", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "24px" }}>
            <div className="empty-state">
              {search ? t("noStudentsMatched") : t("noStudentsFoundYet")}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
