import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ms = await prisma.markingScheme.findFirst();
    if (!ms) return NextResponse.json({ item: null });

    const marks = [
      ms.mark1, ms.mark2, ms.mark3, ms.mark4, ms.mark5,
      ms.mark6, ms.mark7, ms.mark8, ms.mark9, ms.mark10,
    ];
    const criteria = [
      ms.criteria1, ms.criteria2, ms.criteria3, ms.criteria4, ms.criteria5,
      ms.criteria6, ms.criteria7, ms.criteria8, ms.criteria9, ms.criteria10,
    ];

    const items = marks
      .map((m, i) => ({ no: i + 1, marks: m ?? undefined, criteria: criteria[i] ?? undefined }))
      .filter((it) => typeof it.marks === "number");

    return NextResponse.json({
      item: {
        courseCode: ms.courseCode,
        examType: ms.examType,
        items,
      },
    });
  } catch (err: any) {
    console.error("GET /marking-scheme error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to load Marking Scheme" },
      { status: 500 }
    );
  }
}
