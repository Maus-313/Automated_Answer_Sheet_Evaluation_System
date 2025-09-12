import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slot = searchParams.get("slot")?.trim();
    const qps = await prisma.questionPaper.findMany({
      where: slot ? { slot } : undefined,
      orderBy: [{ courseCode: "asc" }, { slot: "asc" }, { examType: "asc" }],
    });

    if (!qps || qps.length === 0) return NextResponse.json({ items: [] });

    const items = qps.map((qp) => {
      const questionsRaw = [
        qp.question1,
        qp.question2,
        qp.question3,
        qp.question4,
        qp.question5,
        qp.question6,
        qp.question7,
        qp.question8,
        qp.question9,
        qp.question10,
      ];
      const questions = questionsRaw
        .map((text, idx) => ({ no: idx + 1, text }))
        .filter((q) => typeof q.text === "string" && q.text.trim().length > 0);

      return {
        subject: qp.subject,
        slot: qp.slot,
        courseCode: qp.courseCode,
        examType: qp.examType,
        questions,
      };
    });

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error("GET /question-paper error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to load Question Paper" },
      { status: 500 }
    );
  }
}
