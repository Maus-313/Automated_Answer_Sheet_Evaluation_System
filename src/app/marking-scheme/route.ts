import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slot = searchParams.get("slot")?.trim();
    const courseCode = searchParams.get("courseCode")?.trim() || undefined;
    const examType = searchParams.get("examType")?.trim() || undefined;
    let ms: any = null;
    if (slot || courseCode || examType) {
      try {
        // Cast to any to tolerate older Prisma Client types until migration is applied
        ms = await prisma.markingScheme.findFirst({
          where: { ...(slot ? { slot } : {}), ...(courseCode ? { courseCode } : {}), ...(examType ? { examType: examType as any } : {}) } as any,
        });
      } catch (e: any) {
        const msg = String(e?.message ?? "");
        if (msg.includes("Unknown argument `slot`")) {
          // Schema not migrated yet; report no record instead of error
          return NextResponse.json({ item: null });
        }
        throw e;
      }
    } else {
      ms = await prisma.markingScheme.findFirst();
    }
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
        slot: ms.slot,
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

export async function POST(req: Request) {
  try {
    const { courseCode, slot, examType, marks, criteria } = await req.json();

    if (!courseCode || !slot || !examType || !marks || !criteria) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updateData: any = {
      courseCode,
      slot,
      examType
    };

    for (let i = 1; i <= 10; i++) {
      updateData[`mark${i}`] = marks[i] !== undefined ? marks[i] : null;
      updateData[`criteria${i}`] = criteria[i] !== undefined ? criteria[i] : null;
    }

    const created = await prisma.markingScheme.create({
      data: updateData,
    });

    return NextResponse.json({ success: true, item: created });
  } catch (err: any) {
    console.error("POST /marking-scheme error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to create Marking Scheme" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { originalCourseCode, originalExamType, courseCode, slot, examType, marks, criteria } = await req.json();

    if (!originalCourseCode || !originalExamType || !courseCode || !slot || !examType || !marks || !criteria) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update the marking scheme with new data
    const updateData: any = {
      courseCode,
      slot,
      examType
    };

    for (let i = 1; i <= 10; i++) {
      updateData[`mark${i}`] = marks[i] !== undefined ? marks[i] : null;
      updateData[`criteria${i}`] = criteria[i] !== undefined ? criteria[i] : null;
    }

    const updated = await prisma.markingScheme.update({
      where: { courseCode_slot_examType: { courseCode: originalCourseCode, slot, examType: originalExamType } },
      data: updateData,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    console.error("PUT /marking-scheme error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to update Marking Scheme" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseCode = searchParams.get("courseCode")?.trim();
    const slot = searchParams.get("slot")?.trim();
    const examType = searchParams.get("examType")?.trim();

    if (!courseCode || !slot || !examType) {
      return NextResponse.json({ error: "Missing courseCode, slot, or examType" }, { status: 400 });
    }

    await prisma.markingScheme.delete({
      where: { courseCode_slot_examType: { courseCode, slot, examType: examType as any } },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /marking-scheme error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to delete Marking Scheme" },
      { status: 500 }
    );
  }
}
