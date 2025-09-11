"use client";

import { useEffect, useState } from "react";
import AnswerSheetTable from "@/components/AnswerSheetTable";
import QuestionPaper from "@/components/QuestionPaper";
import MarkingScheme from "@/components/MarkingScheme";

type QpItem = {
  subject: string;
  slot: string;
  courseCode: string;
  examType?: "CAT" | "FAT" | string;
  questions: Array<{ no: number; text: string }>;
};

type MsItem = {
  courseCode: string;
  examType?: "CAT" | "FAT" | string;
  items: Array<{ no: number; marks: number; criteria?: string }>;
};

export default function Home() {
  const [qp, setQp] = useState<QpItem | null>(null);
  const [qpLoading, setQpLoading] = useState(true);
  const [qpError, setQpError] = useState<string | null>(null);

  const [ms, setMs] = useState<MsItem | null>(null);
  const [msLoading, setMsLoading] = useState(true);
  const [msError, setMsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setQpLoading(true);
        setMsLoading(true);
        const [qpRes, msRes] = await Promise.all([
          fetch("/question-paper", { cache: "no-store" }),
          fetch("/marking-scheme", { cache: "no-store" }),
        ]);

        const [qpJson, msJson] = await Promise.all([qpRes.json(), msRes.json()]);

        if (!qpRes.ok) throw new Error(qpJson?.error || "Failed to load question paper");
        if (!msRes.ok) throw new Error(msJson?.error || "Failed to load marking scheme");

        if (!cancelled) {
          setQp(qpJson?.item ?? null);
          setMs(msJson?.item ?? null);
        }
      } catch (e: any) {
        if (!cancelled) {
          const msg = e?.message || "Failed to load data";
          // attribute the error to both sections to simplify UI
          setQpError(msg);
          setMsError(msg);
        }
      } finally {
        if (!cancelled) {
          setQpLoading(false);
          setMsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full mx-auto">
        {/* Question Paper Section with AnswerSheet-style chrome */}
        {qpLoading || qpError || !qp ? (
          <section className="w-full flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Question Paper</h2>
            <div className="w-full rounded-md border border-black/10 dark:border-white/20">
              {qpLoading ? (
                <div className="px-3 py-2 text-sm">Loading...</div>
              ) : qpError ? (
                <div className="px-3 py-2 text-sm text-red-600 dark:text-red-400">{qpError}</div>
              ) : (
                <div className="px-3 py-2 text-sm">No record found</div>
              )}
            </div>
          </section>
        ) : (
          <QuestionPaper
            subject={qp.subject}
            slot={qp.slot}
            courseCode={qp.courseCode}
            examType={qp.examType}
            questions={qp.questions}
          />
        )}

        {/* Marking Scheme Section with AnswerSheet-style chrome */}
        {msLoading || msError || !ms ? (
          <section className="w-full flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Marking Scheme</h2>
            <div className="w-full rounded-md border border-black/10 dark:border-white/20">
              {msLoading ? (
                <div className="px-3 py-2 text-sm">Loading...</div>
              ) : msError ? (
                <div className="px-3 py-2 text-sm text-red-600 dark:text-red-400">{msError}</div>
              ) : (
                <div className="px-3 py-2 text-sm">No record found</div>
              )}
            </div>
          </section>
        ) : (
          <MarkingScheme courseCode={ms.courseCode} examType={ms.examType} items={ms.items} />
        )}

        <AnswerSheetTable />
      </main>
    </div>
  );
}
