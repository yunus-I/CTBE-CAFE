import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createRecordDate } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const mealCardNumber = request.nextUrl.searchParams.get("mealCardNumber")?.trim().toUpperCase();

  if (!mealCardNumber) {
    return NextResponse.json({ error: "Meal card number is required." }, { status: 400 });
  }

  const student = await prisma.student.findUnique({
    where: { mealCardNumber },
    include: {
      mealRecords: {
        where: { recordDate: createRecordDate() },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "No student found for that card number." }, { status: 404 });
  }

  return NextResponse.json({
    student: {
      ...student,
      mealsToday: student.mealRecords,
    },
  });
}
