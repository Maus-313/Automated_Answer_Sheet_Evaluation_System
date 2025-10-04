import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slot = searchParams.get("slot")?.trim();
    const rows = await prisma.answerSheet.findMany({ where: slot ? { slot } : undefined });
    return NextResponse.json({ items: rows });
  } catch (err: any) {
    console.error("GET /answers error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to load AnswerSheet" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { rollNo, name, slot, examType, ...answers } = await req.json();

    if (!rollNo || !name || !slot || !examType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const data: any = {
      rollNo,
      name,
      slot,
      examType
    };
    for (let i = 1; i <= 10; i++) {
      data[`answer${i}`] = answers[`answer${i}`] !== undefined ? answers[`answer${i}`] : null;
    }

    const created = await prisma.answerSheet.create({
      data,
    });

    return NextResponse.json({ success: true, item: created });
  } catch (err: any) {
    console.error("POST /answers error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to create AnswerSheet" },
      { status: 500 }
    );
  }
}
