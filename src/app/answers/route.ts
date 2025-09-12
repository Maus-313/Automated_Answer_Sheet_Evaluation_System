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
