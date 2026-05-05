import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { mealTypes } from "@/lib/constants";
import { createRecordDate } from "@/lib/utils";

const mealSchema = z.object({
  mealType: z.enum(mealTypes),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const parsed = mealSchema.parse(await request.json());

    await prisma.mealRecord.create({
      data: {
        studentId: id,
        mealType: parsed.mealType,
        recordDate: createRecordDate(),
      },
    });

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        mealRecords: {
          where: { recordDate: createRecordDate() },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: `${parsed.mealType.toLowerCase()} recorded successfully.`,
      student: {
        ...student,
        mealsToday: student.mealRecords,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid meal type." }, { status: 400 });
    }

    if (isPrismaUniqueError(error)) {
      return NextResponse.json(
        { error: "This meal has already been recorded for the student today." },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "Could not record meal." }, { status: 500 });
  }
}

function isPrismaUniqueError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}
