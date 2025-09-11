// app/api/ai/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Strong system instruction to force Prisma upsert code for QuestionPaper
const SYSTEM_INSTRUCTION = `
You are a code generator that outputs ONLY a TypeScript Prisma Client snippet to update the QuestionPaper table. 
Requirements:
- Always output one fenced code block with TypeScript, nothing else.
- Use: import { PrismaClient } from '@prisma/client'
- Use prisma.questionPaper.upsert with where.courseCode_slot_examType.
- Fill fields from the user's prompt. If data is missing, leave nullable question fields undefined.
- examType must be 'CAT' or 'FAT'.
- Map questions into question1..question10 (strings). If CAT, typically use question1..question5. If FAT, up to question10.
- Include an async main() wrapper and prisma.$disconnect() in finally.

Prisma shape reminder (QuestionPaper): { subject: string; slot: string; courseCode: string; examType: 'CAT' | 'FAT'; question1?: string | null; ... question10?: string | null }

Example format:
\`\`\`ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.questionPaper.upsert({
    where: {
      courseCode_slot_examType: {
        courseCode: 'MATH101',
        slot: 'A1',
        examType: 'CAT',
      },
    },
    update: {
      subject: 'Applied Mathematics',
      question1: 'Define continuity with example',
      question2: 'Evaluate ∫(2x + 3) dx',
    },
    create: {
      subject: 'Applied Mathematics',
      slot: 'A1',
      courseCode: 'MATH101',
      examType: 'CAT',
      question1: 'Define continuity with example',
      question2: 'Evaluate ∫(2x + 3) dx',
    },
  })
}

main().finally(() => prisma.$disconnect())
\`\`\`
`;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: prompt,
      config: {
        // Our enforced system prompt + optional user-provided tail
        systemInstruction: [SYSTEM_INSTRUCTION, process.env.CUSTOM_PROMPT]
          .filter(Boolean)
          .join("\n\n"),
      },
    });

    // .text contains the plain text answer
    return NextResponse.json({ output: res.text });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "AI request failed" },
      { status: 500 }
    );
  }
}
