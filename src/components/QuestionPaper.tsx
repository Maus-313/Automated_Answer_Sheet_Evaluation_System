"use client";

import { useEffect, useState } from "react";

type Item = {
  subject: string;
  slot: string;
  courseCode: string;
  examType?: "CAT" | "FAT" | string;
  questions: Array<{ no: number; text: string }>;
};

type QuestionPaperProps = Partial<Item> & { questions?: Item["questions"] };

export default function QuestionPaper(props: QuestionPaperProps) {
  const hasProps = !!props?.courseCode || !!props?.subject || !!props?.questions?.length;
  const [item, setItem] = useState<Item | null>(hasProps ? (props as Item) : null);
  const [loading, setLoading] = useState(!hasProps);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasProps) return; // render from provided props
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/question-paper", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load question paper");
        if (!cancelled) setItem(data?.item ?? null);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load question paper");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasProps]);

  const subject = item?.subject ?? props.subject;
  const slot = item?.slot ?? props.slot;
  const courseCode = item?.courseCode ?? props.courseCode;
  const examType = item?.examType ?? props.examType;
  const questions = item?.questions ?? props.questions ?? [];

  return (
    <section className="w-full flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Question Paper</h2>
      {loading || error || !item && !hasProps ? (
        <div className="w-full rounded-md border border-black/10 dark:border-white/20">
          {loading ? (
            <div className="px-3 py-2 text-sm">Loading...</div>
          ) : error ? (
            <div className="px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>
          ) : (
            <div className="px-3 py-2 text-sm">No record found</div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
            <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
              <div className="text-muted-foreground">Subject</div>
              <div className="font-medium">{subject}</div>
            </div>
            <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
              <div className="text-muted-foreground">Slot</div>
              <div className="font-medium">{slot}</div>
            </div>
            <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
              <div className="text-muted-foreground">Course Code</div>
              <div className="font-medium">{courseCode}</div>
            </div>
            {examType ? (
              <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
                <div className="text-muted-foreground">Exam Type</div>
                <div className="font-medium">{examType}</div>
              </div>
            ) : null}
          </div>

          <div className="w-full rounded-md border border-black/10 dark:border-white/20">
            {questions.length === 0 ? (
              <div className="px-3 py-2 text-sm">No questions provided</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                    <th className="px-3 py-2 text-left font-medium w-16">Q#</th>
                    <th className="px-3 py-2 text-left font-medium">Question</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.no} className="border-b border-black/5 dark:border-white/5">
                      <td className="px-3 py-2 align-top whitespace-nowrap font-medium">{q.no}</td>
                      <td className="px-3 py-2 align-top">{q.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </section>
  );
}
