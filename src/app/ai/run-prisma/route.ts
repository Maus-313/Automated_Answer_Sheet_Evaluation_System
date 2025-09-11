import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Parsed = {
  where: { courseCode: string; slot: string; examType: "CAT" | "FAT" };
  update: Partial<Record<
    | "subject"
    | "question1"
    | "question2"
    | "question3"
    | "question4"
    | "question5"
    | "question6"
    | "question7"
    | "question8"
    | "question9"
    | "question10",
    string
  >>;
  create: Parsed["update"] & { subject?: string } & Partial<{ slot: string; courseCode: string; examType: "CAT" | "FAT" }>;
};

function extractBlock(src: string, anchor: string): string | null {
  const idx = src.indexOf(anchor);
  if (idx === -1) return null;
  let i = idx + anchor.length;
  while (i < src.length && src[i] !== "{") i++;
  if (i >= src.length) return null;
  let depth = 0;
  let start = i;
  while (i < src.length) {
    const ch = src[i++];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return src.slice(start, i);
      }
    }
  }
  return null;
}

function valOf(block: string, key: string): string | undefined {
  const re = new RegExp(`${key}\\s*:\\s*'([^']*)'`);
  const m = block.match(re);
  return m ? m[1] : undefined;
}

function parseCode(code: string): Parsed | null {
  // Normalize whitespace
  const src = code.replace(/\r\n?/g, "\n");

  // where keys (inside courseCode_slot_examType)
  const whereBlock = extractBlock(src, "courseCode_slot_examType");
  if (!whereBlock) return null;
  const courseCode = valOf(whereBlock, "courseCode");
  const slot = valOf(whereBlock, "slot");
  const examTypeRaw = valOf(whereBlock, "examType");
  const examType = (examTypeRaw === "CAT" || examTypeRaw === "FAT") ? examTypeRaw : undefined;
  if (!courseCode || !slot || !examType) return null;

  const updateBlock = extractBlock(src, "update");
  const createBlock = extractBlock(src, "create");

  function pickQA(block: string | null) {
    const out: Record<string, string> = {};
    if (!block) return out;
    const subj = valOf(block, "subject");
    if (subj) out.subject = subj;
    for (let i = 1; i <= 10; i++) {
      const k = `question${i}`;
      const v = valOf(block, k);
      if (v) out[k] = v;
    }
    return out;
  }

  const upd = pickQA(updateBlock);
  const crt = pickQA(createBlock);
  // Fill additional required create keys if present
  const crtSlot = valOf(createBlock || "", "slot");
  const crtCourse = valOf(createBlock || "", "courseCode");
  const crtExam = valOf(createBlock || "", "examType") as "CAT" | "FAT" | undefined;

  return {
    where: { courseCode, slot, examType },
    update: upd,
    create: { ...crt, slot: crtSlot, courseCode: crtCourse, examType: crtExam },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body?.code ?? "");
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

    const parsed = parseCode(code);
    if (!parsed) return NextResponse.json({ error: "Failed to parse Prisma code" }, { status: 400 });

    const { where, update, create } = parsed;

    // Upsert with conditional update: only set fields that are null or empty currently
    const existing = await prisma.questionPaper.findUnique({
      where: { courseCode_slot_examType: where },
    });

    if (existing) {
      const patch: Record<string, string> = {};
      const keys = [
        "subject",
        "question1","question2","question3","question4","question5",
        "question6","question7","question8","question9","question10",
      ] as const;
      for (const k of keys) {
        const curr = (existing as any)[k];
        const next = (update as any)[k] ?? (create as any)[k];
        if ((curr === null || curr === "" || typeof curr === "undefined") && typeof next === "string" && next.length > 0) {
          (patch as any)[k] = next;
        }
      }

      if (Object.keys(patch).length === 0) {
        return NextResponse.json({ status: "noop", message: "No fields needed update", where });
      }

      const updated = await prisma.questionPaper.update({
        where: { courseCode_slot_examType: where },
        data: patch,
      });
      return NextResponse.json({ status: "updated", item: updated });
    }

    // Create path: ensure required fields
    if (!create.subject) {
      return NextResponse.json({ error: "Create.subject missing in code" }, { status: 400 });
    }

    const created = await prisma.questionPaper.create({
      data: {
        subject: create.subject!,
        slot: create.slot ?? where.slot,
        courseCode: create.courseCode ?? where.courseCode,
        examType: (create.examType ?? where.examType) as any,
        question1: create.question1 ?? null,
        question2: create.question2 ?? null,
        question3: create.question3 ?? null,
        question4: create.question4 ?? null,
        question5: create.question5 ?? null,
        question6: create.question6 ?? null,
        question7: create.question7 ?? null,
        question8: create.question8 ?? null,
        question9: create.question9 ?? null,
        question10: create.question10 ?? null,
      },
    });
    return NextResponse.json({ status: "created", item: created });
  } catch (err: any) {
    console.error("POST /ai/run-prisma error", err);
    return NextResponse.json({ error: err?.message ?? "Failed to run code" }, { status: 500 });
  }
}

