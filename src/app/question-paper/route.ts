import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ExamType } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const { originalCourseCode, originalExamType, courseCode, slot, examType, marks, totalMarks, questions } = await req.json();

    if (!originalCourseCode || !originalExamType || !courseCode || !slot || !examType || !marks || typeof totalMarks !== 'number') {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update the question paper with new data
    const updateData: any = {
      courseCode,
      examType,
      totalMarks
    };
    for (let i = 1; i <= 10; i++) {
      // Set marks - if not provided, set to null (removed question)
      updateData[`mark${i}`] = marks[i] !== undefined ? marks[i] : null;
      // Set questions - if not provided or empty, set to null (removed question)
      updateData[`question${i}`] = questions && questions[`question${i}`] !== undefined ? questions[`question${i}`] : null;
    }

    const updated = await prisma.questionPaper.update({
      where: { courseCode_slot_examType: { courseCode: originalCourseCode, slot, examType: originalExamType } },
      data: updateData,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    console.error("PUT /question-paper error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to update Question Paper" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { courseCode, slot, examType, subject, marks, totalMarks, questions } = await req.json();

    if (!courseCode || !slot || !examType || !subject || !marks || typeof totalMarks !== 'number') {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updateData: any = {
      courseCode,
      slot,
      examType,
      subject,
      totalMarks
    };
    for (let i = 1; i <= 10; i++) {
      updateData[`mark${i}`] = marks[i] !== undefined ? marks[i] : null;
      updateData[`question${i}`] = questions && questions[`question${i}`] !== undefined ? questions[`question${i}`] : null;
    }

    const created = await prisma.questionPaper.create({
      data: updateData,
    });

    return NextResponse.json({ success: true, item: created });
  } catch (err: any) {
    console.error("POST /question-paper error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to create Question Paper" },
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

    await prisma.questionPaper.delete({
      where: { courseCode_slot_examType: { courseCode, slot, examType: examType as ExamType } },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /question-paper error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to delete Question Paper" },
      { status: 500 }
    );
  }
}

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
      const marksRaw = [
        qp.mark1,
        qp.mark2,
        qp.mark3,
        qp.mark4,
        qp.mark5,
        qp.mark6,
        qp.mark7,
        qp.mark8,
        qp.mark9,
        qp.mark10,
      ];

      const questions = questionsRaw
        .map((text, idx) => ({
          no: idx + 1,
          text: text || '',
          marks: marksRaw[idx] !== null && marksRaw[idx] !== undefined ? marksRaw[idx] : null
        }))
        .filter((q) => q.text.trim().length > 0);

      // Calculate total marks from individual marks if not set
      const calculatedTotalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
      const totalMarks = qp.totalMarks > 0 ? qp.totalMarks : calculatedTotalMarks;

      return {
        subject: qp.subject,
        slot: qp.slot,
        courseCode: qp.courseCode,
        examType: qp.examType,
        questions,
        totalMarks,
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
