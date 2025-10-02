import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { ExamType } from "@prisma/client";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { qp, as, ms } = await req.json();

    if (!qp || !as || !ms) {
      return NextResponse.json({ error: "Missing qp, as, or ms" }, { status: 400 });
    }

    const questions = qp.questions || [];
    const answers = [
      as.answer1, as.answer2, as.answer3, as.answer4, as.answer5,
      as.answer6, as.answer7, as.answer8, as.answer9, as.answer10
    ];
    const criteria = ms.items || [];

    const evalPrompt = `
Evaluate all student answers for the question paper.

Question Paper: ${qp.subject} (${qp.examType})
Student: ${as.rollNo} - ${as.name}

For each question, evaluate the answer based on the marking criteria and assign marks.

${questions.map((q: any, i: number) => `
Question ${i+1}: ${q.text}
Student Answer: ${answers[i] || 'No answer'}
Criteria: ${criteria[i]?.criteria || 'General correctness'}
Max Marks: ${criteria[i]?.marks || 5}
`).join('\n')}

Return a JSON object with marks for each question:
{
  "answer1": number,
  "answer2": number,
  ...
  "answer10": number
}

Only return the JSON, no other text.
`;

    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: evalPrompt,
      config: {
        systemInstruction: "You are an expert evaluator. Evaluate all answers and return only a JSON object with numerical marks for each answer field.",
      },
    });

    const responseText = (res.text || '').trim();
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : '{}';
    const marks = JSON.parse(jsonStr);

    // Ensure all answer fields are numbers
    const result: any = {};
    for (let i = 1; i <= 10; i++) {
      const key = `answer${i}`;
      const max = criteria[i-1]?.marks || 5;
      result[key] = Math.max(0, Math.min((marks as any)[key] || 0, max));
    }

    // Calculate total marks
    const totalMarks = Object.values(result).reduce((sum: number, val: any) => sum + val, 0);

    // Update MarkingSheet
    await prisma.markingSheet.upsert({
      where: { rollNo: as.rollNo },
      update: {
        name: as.name,
        slot: as.slot,
        examType: as.examType as ExamType,
        totalMarks,
        ...result
      },
      create: {
        rollNo: as.rollNo,
        name: as.name,
        slot: as.slot,
        examType: as.examType as ExamType,
        totalMarks,
        ...result
      }
    });

    return NextResponse.json({ marks: result, totalMarks });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Evaluation failed" },
      { status: 500 }
    );
  }
}