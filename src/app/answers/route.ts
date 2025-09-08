import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.answerSheet.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Serialize Dates to ISO for the client
    const data = rows.map((r: { examDate: { toISOString: () => any; }; createdAt: { toISOString: () => any; }; updatedAt: { toISOString: () => any; }; }) => ({
      ...r,
      examDate: r.examDate.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({ items: data });
  } catch (err: any) {
    console.error("GET /answers error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to load AnswerSheet" },
      { status: 500 }
    );
  }
}

