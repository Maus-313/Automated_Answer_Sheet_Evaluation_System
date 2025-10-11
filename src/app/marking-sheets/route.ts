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
    const { rollNo, answer1, answer2, answer3, answer4, answer5, answer6, answer7, answer8, answer9, answer10 } = body;

    if (!rollNo) {
      return NextResponse.json({ error: "rollNo is required" }, { status: 400 });
    }

    const anyPrisma = prisma as any;
    if (!anyPrisma?.markingSheet?.update) {
      return NextResponse.json({ error: "Database not ready" }, { status: 500 });
    }

    // Calculate total marks
    const marks = [answer1, answer2, answer3, answer4, answer5, answer6, answer7, answer8, answer9, answer10]
      .filter(m => m !== null && m !== undefined)
      .reduce((sum, m) => sum + (m || 0), 0);

    const updated = await anyPrisma.markingSheet.update({
      where: { rollNo },
      data: {
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
      }
    });

    return NextResponse.json({ item: updated });
  } catch (err: any) {
    console.error("PUT /marking-sheets error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to update MarkingSheet" },
      { status: 500 }
    );
  }
}
