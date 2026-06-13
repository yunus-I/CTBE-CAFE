import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mealCardNumber = searchParams.get("mealCardNumber");

    if (!mealCardNumber || !/^\d{4}$/.test(mealCardNumber)) {
      return NextResponse.json({ error: "Invalid meal card number." }, { status: 400 });
    }

    const today = new Date();
    const student = await prisma.student.findUnique({
      where: { mealCardNumber },
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

    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        department: student.department,
        year: student.year,
        aauId: student.aauId,
        mealCardNumber: student.mealCardNumber,
        photoUrl: student.photoUrl,
        mealsToday: student.mealRecords.map((record) => ({
          mealType: record.mealType,
          createdAt: record.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Could not search student." }, { status: 500 });
  }
}
