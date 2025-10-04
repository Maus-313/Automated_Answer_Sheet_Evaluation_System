// app/api/ai/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Strong system instruction to force Prisma upsert code for QuestionPaper
const getSystemInstruction = (targetModel: string) => {
  if (targetModel === 'QuestionPaper') {
    return `
You are a code generator that outputs ONLY a TypeScript Prisma Client snippet to update the QuestionPaper table.
Requirements:
- Always output one fenced code block with TypeScript, nothing else.
- Use: import { PrismaClient } from '@prisma/client'
- Use prisma.questionPaper.upsert with where.courseCode_slot_examType.
- Fill fields from the user's prompt. If data is missing, leave nullable question fields undefined.
- examType must be 'CAT', 'FAT', or 'ASSESSMENT'.
- Map questions into question1..question10 (strings). CAT typically uses 1-5, FAT/ASSESSMENT use 1-10.
- IMPORTANT: Extract ONLY questions from the provided text. COMPLETELY IGNORE any student answers, solutions, or answer sections.
- If the text contains both questions and answers, extract only the question parts.
- Auto-detect exam type from content: look for "CAT", "FAT", "Assessment", "Quiz", etc. Default to 'ASSESSMENT' if unclear.
- Include an async main() wrapper and prisma.$disconnect() in finally.

Prisma shape reminder (QuestionPaper): { subject: string; slot: string; courseCode: string; examType: 'CAT' | 'FAT' | 'ASSESSMENT'; question1?: string | null; ... question10?: string | null }

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
        examType: 'ASSESSMENT',
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
      examType: 'ASSESSMENT',
      question1: 'Define continuity with example',
      question2: 'Evaluate ∫(2x + 3) dx',
    },
  })
}

main().finally(() => prisma.$disconnect())
\`\`\`
`;
  } else if (targetModel === 'MarkingScheme') {
    return `
You are a code generator that outputs ONLY a TypeScript Prisma Client snippet to update the MarkingScheme table.
Requirements:
- Always output one fenced code block with TypeScript, nothing else.
- Use: import { PrismaClient } from '@prisma/client'
- Use prisma.markingScheme.upsert with where.courseCode_slot_examType.
- Fill fields from the user's prompt. Map marks and criteria into mark1..mark10 and criteria1..criteria10 (numbers and strings).
- examType must be 'CAT', 'FAT', or 'ASSESSMENT'.
- IMPORTANT: Extract ONLY marking criteria and marks from the provided text. COMPLETELY IGNORE student answers, solutions, or answer sections.
- If the text contains both questions and answers, extract only the marking scheme/criteria parts.
- Auto-detect exam type from content: look for "CAT", "FAT", "Assessment", "Quiz", etc. Default to 'ASSESSMENT' if unclear.
- Include an async main() wrapper and prisma.$disconnect() in finally.

Prisma shape reminder (MarkingScheme): { courseCode: string; slot: string; examType: 'CAT' | 'FAT' | 'ASSESSMENT'; mark1?: number | null; criteria1?: string | null; ... mark10?: number | null; criteria10?: string | null }

Example format:
\`\`\`ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.markingScheme.upsert({
    where: {
      courseCode_slot_examType: {
        courseCode: 'MATH101',
        slot: 'A1',
        examType: 'ASSESSMENT',
      },
    },
    update: {
      mark1: 5,
      criteria1: 'Correct definition',
      mark2: 5,
      criteria2: 'Correct evaluation',
    },
    create: {
      courseCode: 'MATH101',
      slot: 'A1',
      examType: 'ASSESSMENT',
      mark1: 5,
      criteria1: 'Correct definition',
      mark2: 5,
      criteria2: 'Correct evaluation',
    },
  })
}

main().finally(() => prisma.$disconnect())
\`\`\`
`;
  } else if (targetModel === 'AnswerSheet') {
    return `
You are a code generator that outputs ONLY a TypeScript Prisma Client snippet to update the AnswerSheet table.
Requirements:
- Always output one fenced code block with TypeScript, nothing else.
- Use: import { PrismaClient } from '@prisma/client'
- Use prisma.answerSheet.upsert with where.rollNo.
- Fill fields from the user's prompt. Map answers into answer1..answer10 (strings).
- examType must be 'CAT', 'FAT', or 'ASSESSMENT'.
- IMPORTANT: Extract ONLY student answers from the provided text. COMPLETELY IGNORE questions, marking schemes, or criteria sections.
- If the text contains both questions and answers, extract only the answer parts.
- Auto-detect exam type from content: look for "CAT", "FAT", "Assessment", "Quiz", etc. Default to 'ASSESSMENT' if unclear.
- Include an async main() wrapper and prisma.$disconnect() in finally.
- Automatically round of the the slot to nearest matching. Use this array for rounding off; All possible Slots = [A1, A2, B1, B2, C1, C2, D1, D2, E1, E2, F1, F2, G1, G2]. Some example if you detect slot to be something like FL round of it to F1; or for example you get something liek this GL-TG2 round off this to G2, Simple as as it is. Okay Don't run any stupid function to do this. You have to do this on your own
- CRITICAL: Use literal values directly in the upsert object. Do NOT define variables like const rollNo = '...'; instead, put the values directly as strings or numbers in the where, update, and create blocks.

- 
Prisma shape reminder (AnswerSheet): { rollNo: string; name: string; slot: string; examType: 'CAT' | 'FAT' | 'ASSESSMENT'; answer1?: string | null; ... answer10?: string | null }

Example format:
\`\`\`ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.answerSheet.upsert({
    where: {
      rollNo: '12345',
    },
    update: {
      name: 'John Doe',
      slot: 'A1',
      examType: 'ASSESSMENT',
      answer1: 'Answer 1',
      answer2: 'Answer 2',
    },
    create: {
      rollNo: '12345',
      name: 'John Doe',
      slot: 'A1',
      examType: 'ASSESSMENT',
      answer1: 'Answer 1',
      answer2: 'Answer 2',
    },
  })
}

main().finally(() => prisma.$disconnect())
\`\`\`
`;
  }
  return '';
};

export async function POST(req: Request) {
  try {
    const { prompt, targetModel } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const systemInstruction = getSystemInstruction(targetModel || 'QuestionPaper');

    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: prompt,
      config: {
        // Our enforced system prompt + optional user-provided tail
        systemInstruction: [systemInstruction, process.env.CUSTOM_PROMPT]
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
