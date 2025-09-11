import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const qp = await prisma.questionPaper.findFirst();
    if (!qp) return NextResponse.json({ item: null });

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

    return NextResponse.json({
      item: {
        subject: qp.subject,
        slot: qp.slot,
        courseCode: qp.courseCode,
        examType: qp.examType,
        questions,
      },
    });
  } catch (err: any) {
    console.error("GET /question-paper error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to load Question Paper" },
      { status: 500 }
    );
  }
}
