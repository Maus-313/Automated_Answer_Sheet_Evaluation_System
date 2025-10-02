import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Parsed = {
  model: 'QuestionPaper' | 'MarkingScheme' | 'AnswerSheet';
  where: Record<string, any>;
  update: Record<string, any>;
  create: Record<string, any>;
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

function valOf(block: string, key: string): string | number | undefined {
  const re = new RegExp(`${key}\\s*:\\s*(?:'([^']*)'|(\\d+))`);
  const m = block.match(re);
  if (m) {
    return m[1] !== undefined ? m[1] : (m[2] !== undefined ? parseInt(m[2]) : undefined);
  }
  return undefined;
}

function parseCode(code: string): Parsed | null {
  // Normalize whitespace
  const src = code.replace(/\r\n?/g, "\n");

  // Extract model name
  const modelMatch = src.match(/prisma\.(\w+)\.upsert/);
  if (!modelMatch) return null;
  const modelRaw = modelMatch[1];
  const model = (modelRaw === 'questionPaper' ? 'QuestionPaper' : modelRaw === 'markingScheme' ? 'MarkingScheme' : modelRaw === 'answerSheet' ? 'AnswerSheet' : null) as Parsed['model'];
  if (!model) return null;

  const whereBlock = extractBlock(src, "where");
  if (!whereBlock) return null;

  const updateBlock = extractBlock(src, "update");
  const createBlock = extractBlock(src, "create");

  let where: Record<string, any> = {};
  let update: Record<string, any> = {};
  let create: Record<string, any> = {};

  if (model === 'QuestionPaper' || model === 'MarkingScheme') {
    const innerWhere = extractBlock(whereBlock, "courseCode_slot_examType");
    if (!innerWhere) return null;
    const courseCode = valOf(innerWhere, "courseCode");
    const slot = valOf(innerWhere, "slot");
    const examTypeRaw = valOf(innerWhere, "examType");
    const examType = (examTypeRaw === "CAT" || examTypeRaw === "FAT" || examTypeRaw === "ASSESSMENT") ? examTypeRaw : undefined;
    if (!courseCode || !slot || !examType) return null;
    where = { courseCode_slot_examType: { courseCode, slot, examType } };

    // Parse update and create
    if (updateBlock) {
      const subj = valOf(updateBlock, "subject");
      if (subj) update.subject = subj;
      for (let i = 1; i <= 10; i++) {
        const qk = `question${i}`;
        const qv = valOf(updateBlock, qk);
        if (qv !== undefined) update[qk] = qv;
        if (model === 'MarkingScheme') {
          const mk = `mark${i}`;
          const mv = valOf(updateBlock, mk);
          if (mv !== undefined) update[mk] = mv;
          const ck = `criteria${i}`;
          const cv = valOf(updateBlock, ck);
          if (cv !== undefined) update[ck] = cv;
        }
      }
    }
    if (createBlock) {
      const subj = valOf(createBlock, "subject");
      if (subj) create.subject = subj;
      for (let i = 1; i <= 10; i++) {
        const qk = `question${i}`;
        const qv = valOf(createBlock, qk);
        if (qv !== undefined) create[qk] = qv;
        if (model === 'MarkingScheme') {
          const mk = `mark${i}`;
          const mv = valOf(createBlock, mk);
          if (mv !== undefined) create[mk] = mv;
          const ck = `criteria${i}`;
          const cv = valOf(createBlock, ck);
          if (cv !== undefined) create[ck] = cv;
        }
      }
      const crtSlot = valOf(createBlock, "slot");
      const crtCourse = valOf(createBlock, "courseCode");
      const crtExam = valOf(createBlock, "examType");
      if (crtSlot) create.slot = crtSlot;
      if (crtCourse) create.courseCode = crtCourse;
      if (crtExam) create.examType = crtExam;
    }
  } else if (model === 'AnswerSheet') {
    const rollNo = valOf(whereBlock, "rollNo");
    if (!rollNo) return null;
    where = { rollNo };

    if (updateBlock) {
      const name = valOf(updateBlock, "name");
      if (name) update.name = name;
      const slot = valOf(updateBlock, "slot");
      if (slot) update.slot = slot;
      const examType = valOf(updateBlock, "examType");
      if (examType) update.examType = examType;
      for (let i = 1; i <= 10; i++) {
        const ak = `answer${i}`;
        const av = valOf(updateBlock, ak);
        if (av !== undefined) update[ak] = av;
      }
    }
    if (createBlock) {
      const name = valOf(createBlock, "name");
      if (name) create.name = name;
      const slot = valOf(createBlock, "slot");
      if (slot) create.slot = slot;
      const examType = valOf(createBlock, "examType");
      if (examType) create.examType = examType;
      for (let i = 1; i <= 10; i++) {
        const ak = `answer${i}`;
        const av = valOf(createBlock, ak);
        if (av !== undefined) create[ak] = av;
      }
    }
  }

  return { model, where, update, create };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body?.code ?? "");
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

    const parsed = parseCode(code);
    if (!parsed) return NextResponse.json({ error: "Failed to parse Prisma code" }, { status: 400 });

    const { model, where, update, create } = parsed;

    if (model === 'QuestionPaper') {
      const qpWhere = where as any;
      const existing = await prisma.questionPaper.findUnique({ where: qpWhere });
      if (existing) {
        const patch: Record<string, any> = {};
        const keys = ["subject", "question1","question2","question3","question4","question5","question6","question7","question8","question9","question10"];
        for (const k of keys) {
          const curr = (existing as any)[k];
          const next = update[k] ?? create[k];
          if ((curr === null || curr === "" || typeof curr === "undefined") && typeof next === "string" && next.length > 0) {
            patch[k] = next;
          }
        }
        if (Object.keys(patch).length === 0) {
          return NextResponse.json({ status: "noop", message: "No fields needed update", where });
        }
        const updated = await prisma.questionPaper.update({ where: qpWhere, data: patch });
        return NextResponse.json({ status: "updated", item: updated });
      } else {
        if (!create.subject) return NextResponse.json({ error: "Create.subject missing in code" }, { status: 400 });
        const created = await prisma.questionPaper.create({
          data: {
            subject: create.subject,
            slot: create.slot ?? qpWhere.courseCode_slot_examType.slot,
            courseCode: create.courseCode ?? qpWhere.courseCode_slot_examType.courseCode,
            examType: (create.examType ?? qpWhere.courseCode_slot_examType.examType) as any,
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
      }
    } else if (model === 'MarkingScheme') {
      const msWhere = where as any;
      const existing = await prisma.markingScheme.findUnique({ where: msWhere });
      if (existing) {
        const patch: Record<string, any> = {};
        const keys = ["mark1","criteria1","mark2","criteria2","mark3","criteria3","mark4","criteria4","mark5","criteria5","mark6","criteria6","mark7","criteria7","mark8","criteria8","mark9","criteria9","mark10","criteria10"];
        for (const k of keys) {
          const curr = (existing as any)[k];
          const next = update[k] ?? create[k];
          if ((curr === null || curr === "" || typeof curr === "undefined") && next !== undefined) {
            patch[k] = next;
          }
        }
        if (Object.keys(patch).length === 0) {
          return NextResponse.json({ status: "noop", message: "No fields needed update", where });
        }
        const updated = await prisma.markingScheme.update({ where: msWhere, data: patch });
        return NextResponse.json({ status: "updated", item: updated });
      } else {
        const created = await prisma.markingScheme.create({
          data: {
            courseCode: create.courseCode ?? msWhere.courseCode_slot_examType.courseCode,
            slot: create.slot ?? msWhere.courseCode_slot_examType.slot,
            examType: (create.examType ?? msWhere.courseCode_slot_examType.examType) as any,
            mark1: create.mark1 ?? null,
            criteria1: create.criteria1 ?? null,
            mark2: create.mark2 ?? null,
            criteria2: create.criteria2 ?? null,
            mark3: create.mark3 ?? null,
            criteria3: create.criteria3 ?? null,
            mark4: create.mark4 ?? null,
            criteria4: create.criteria4 ?? null,
            mark5: create.mark5 ?? null,
            criteria5: create.criteria5 ?? null,
            mark6: create.mark6 ?? null,
            criteria6: create.criteria6 ?? null,
            mark7: create.mark7 ?? null,
            criteria7: create.criteria7 ?? null,
            mark8: create.mark8 ?? null,
            criteria8: create.criteria8 ?? null,
            mark9: create.mark9 ?? null,
            criteria9: create.criteria9 ?? null,
            mark10: create.mark10 ?? null,
            criteria10: create.criteria10 ?? null,
          },
        });
        return NextResponse.json({ status: "created", item: created });
      }
    } else if (model === 'AnswerSheet') {
      const asWhere = where as any;
      const existing = await prisma.answerSheet.findUnique({ where: asWhere });
      if (existing) {
        const patch: Record<string, any> = {};
        const keys = ["name","slot","examType","answer1","answer2","answer3","answer4","answer5","answer6","answer7","answer8","answer9","answer10"];
        for (const k of keys) {
          const curr = (existing as any)[k];
          const next = update[k] ?? create[k];
          if ((curr === null || curr === "" || typeof curr === "undefined") && next !== undefined) {
            patch[k] = next;
          }
        }
        if (Object.keys(patch).length === 0) {
          return NextResponse.json({ status: "noop", message: "No fields needed update", where });
        }
        const updated = await prisma.answerSheet.update({ where: asWhere, data: patch });
        return NextResponse.json({ status: "updated", item: updated });
      } else {
        if (!create.name || !create.slot || !create.examType) {
          return NextResponse.json({ error: "Create missing required fields" }, { status: 400 });
        }
        const created = await prisma.answerSheet.create({
          data: {
            rollNo: asWhere.rollNo,
            name: create.name,
            slot: create.slot,
            examType: create.examType as any,
            answer1: create.answer1 ?? null,
            answer2: create.answer2 ?? null,
            answer3: create.answer3 ?? null,
            answer4: create.answer4 ?? null,
            answer5: create.answer5 ?? null,
            answer6: create.answer6 ?? null,
            answer7: create.answer7 ?? null,
            answer8: create.answer8 ?? null,
            answer9: create.answer9 ?? null,
            answer10: create.answer10 ?? null,
          },
        });
        return NextResponse.json({ status: "created", item: created });
      }
    }

    return NextResponse.json({ error: "Unsupported model" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /ai/run-prisma error", err);
    return NextResponse.json({ error: err?.message ?? "Failed to run code" }, { status: 500 });
  }
}

