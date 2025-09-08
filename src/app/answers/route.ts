import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.answerSheet.findMany();
    return NextResponse.json({ items: rows });
  } catch (err: any) {
    console.error("GET /answers error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to load AnswerSheet" },
      { status: 500 }
    );
  }
}
