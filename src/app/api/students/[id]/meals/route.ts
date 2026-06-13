import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createRecordDate } from "@/lib/utils";
import { startOfDay, endOfDay } from "date-fns";

export const runtime = "nodejs";

const mealSchema = z.object({
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER"]),
});

async function getStudentWithMealsToday(studentId: string) {
  const today = new Date();
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      mealRecords: {
        where: {
          recordDate: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
        },
      },
    },
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as unknown;
    const { mealType } = mealSchema.parse(body);

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    const recordDate = createRecordDate();

    try {
      await prisma.mealRecord.create({
        data: {
          studentId: id,
          mealType,
          recordDate,
        },
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Meal already recorded for today." },
          { status: 409 },
        );
      }
      throw error;
    }

    const updated = await getStudentWithMealsToday(id);
    if (!updated) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Meal recorded successfully.",
      student: {
        id: updated.id,
        name: updated.name,
        department: updated.department,
        year: updated.year,
        aauId: updated.aauId,
        mealCardNumber: updated.mealCardNumber,
        photoUrl: updated.photoUrl,
        mealsToday: updated.mealRecords.map((r) => ({
          mealType: r.mealType,
          createdAt: r.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request data." },
        { status: 400 },
      );
    }
    console.error("POST /meals error:", error);
    return NextResponse.json(
      { error: "Could not record meal." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as unknown;
    const { mealType } = mealSchema.parse(body);

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    const recordDate = createRecordDate();

    const existing = await prisma.mealRecord.findUnique({
      where: {
        studentId_mealType_recordDate: {
          studentId: id,
          mealType,
          recordDate,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "No meal record found to undo." },
        { status: 404 },
      );
    }

    await prisma.mealRecord.delete({ where: { id: existing.id } });

    const updated = await getStudentWithMealsToday(id);
    if (!updated) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Meal record removed.",
      student: {
        id: updated.id,
        name: updated.name,
        department: updated.department,
        year: updated.year,
        aauId: updated.aauId,
        mealCardNumber: updated.mealCardNumber,
        photoUrl: updated.photoUrl,
        mealsToday: updated.mealRecords.map((r) => ({
          mealType: r.mealType,
          createdAt: r.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request data." },
        { status: 400 },
      );
    }
    console.error("DELETE /meals error:", error);
    return NextResponse.json(
      { error: "Could not undo meal record." },
      { status: 500 },
    );
  }
}
