import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slot = searchParams.get("slot")?.trim();
    // Handle pre-migration client gracefully
    const anyPrisma = prisma as any;
    if (!anyPrisma?.markingSheet?.findMany) {
      // Prisma Client not regenerated yet; return empty so UI shows "No Record Found"
      return NextResponse.json({ items: [] });
    }
    const rows = await anyPrisma.markingSheet.findMany({
      where: slot ? { slot } : undefined,
    });
    return NextResponse.json({ items: rows });
  } catch (err: any) {
    console.error("GET /marking-sheets error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to load MarkingSheet" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { originalRollNo, rollNo, name, slot, examType, answer1, answer2, answer3, answer4, answer5, answer6, answer7, answer8, answer9, answer10 } = body;

    if (!originalRollNo) {
      return NextResponse.json({ error: "originalRollNo is required" }, { status: 400 });
    }

    const anyPrisma = prisma as any;
    if (!anyPrisma?.markingSheet?.update) {
      return NextResponse.json({ error: "Database not ready" }, { status: 500 });
    }

    // Calculate total marks
    const marks = [answer1, answer2, answer3, answer4, answer5, answer6, answer7, answer8, answer9, answer10]
      .filter(m => m !== null && m !== undefined)
      .reduce((sum, m) => sum + (m || 0), 0);

    const updateData: any = {
      answer1,
      answer2,
      answer3,
      answer4,
      answer5,
      answer6,
      answer7,
      answer8,
      answer9,
      answer10,
      totalMarks: marks
    };

    if (name !== undefined) updateData.name = name;
    if (slot !== undefined) updateData.slot = slot;
    if (examType !== undefined) updateData.examType = examType;

    let updated;
    if (rollNo && rollNo !== originalRollNo) {
      // RollNo is changing, need to handle carefully
      // First, check if new rollNo exists
      const existing = await anyPrisma.markingSheet.findUnique({ where: { rollNo } });
      if (existing) {
        return NextResponse.json({ error: "New roll number already exists" }, { status: 400 });
      }
      // Delete old record and create new one
      await anyPrisma.markingSheet.delete({ where: { rollNo: originalRollNo } });
      updated = await anyPrisma.markingSheet.create({
        data: {
          rollNo,
          name: name || '',
          slot: slot || '',
          examType: examType || 'CAT',
          ...updateData
        }
      });
    } else {
      updated = await anyPrisma.markingSheet.update({
        where: { rollNo: originalRollNo },
        data: updateData
      });
    }

    return NextResponse.json({ item: updated });
  } catch (err: any) {
    console.error("PUT /marking-sheets error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to update MarkingSheet" },
      { status: 500 }
    );
  }
}
