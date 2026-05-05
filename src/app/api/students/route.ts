import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const studentSchema = z.object({
  name: z.string().trim().min(2),
  department: z.string().trim().min(2),
  year: z.coerce.number().int().min(1).max(8),
  mealCardNumber: z.string().trim().regex(/^\d{4}$/, "Meal card number must be exactly 4 digits."),
  aauId: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^UGR-\d{4}-\d{2}$/, "AAU ID must match UGR-1234-12."),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = studentSchema.parse({
      name: formData.get("name"),
      department: formData.get("department"),
      year: formData.get("year"),
      mealCardNumber: formData.get("mealCardNumber"),
      aauId: formData.get("aauId"),
    });

    const photo = formData.get("photo");
    const photoUrl =
      photo instanceof File && photo.size > 0 ? await savePhoto(photo, parsed.mealCardNumber) : null;

    await prisma.student.create({
      data: {
        ...parsed,
        mealCardNumber: parsed.mealCardNumber,
        aauId: parsed.aauId,
        photoUrl,
      },
    });

    return NextResponse.json({ message: "Student registered successfully." }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid form data." }, { status: 400 });
    }

    if (isPrismaUniqueError(error)) {
      return NextResponse.json(
        { error: "Meal card number or AAU ID already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "Could not register student." }, { status: 500 });
  }
}

async function savePhoto(file: File, cardNumber: string) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const fileName = `${cardNumber.toLowerCase()}-${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), bytes);
  return `/uploads/${fileName}`;
}

function isPrismaUniqueError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}
