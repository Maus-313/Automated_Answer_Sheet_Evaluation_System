"use client";

import { useEffect, useMemo, useState } from "react";

export type AnswerSheet = {
  rollNo: string;
  name: string;
  slot: string;
  examType: "CAT" | "FAT" | string;
  totalMarks: number;
  answer1?: number | null;
  answer2?: number | null;
  answer3?: number | null;
  answer4?: number | null;
  answer5?: number | null;
  answer6?: number | null;
  answer7?: number | null;
  answer8?: number | null;
  answer9?: number | null;
  answer10?: number | null;
};

function fmt(dt: string) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function AnswerSheetTable() {
  const [rows, setRows] = useState<AnswerSheet[] | null>(null);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [rowsError, setRowsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setRowsLoading(true);
        const res = await fetch("/answers", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load answers");
        if (!cancelled) setRows(Array.isArray(data?.items) ? data.items : []);
      } catch (e: any) {
        if (!cancelled) setRowsError(e?.message || "Failed to load answers");
      } finally {
        if (!cancelled) setRowsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const header = useMemo(
    () => (
      <thead>
        <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
          <th className="px-3 py-2 text-left text-sm font-medium whitespace-nowrap">Roll No</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Name</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Slot</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Exam Type</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Total Marks</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Ans 1</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Ans 2</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Ans 3</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Ans 4</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Ans 5</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Ans 6</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Ans 7</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Ans 8</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Ans 9</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Ans 10</th>
        </tr>
      </thead>
    ),
    []
  );

  return (
    <section className="w-full flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Answer Sheets</h2>
      <div className="w-full rounded-md border border-black/10 dark:border-white/20">
        {rowsLoading ? (
          <div className="px-3 py-2 text-sm">Loading...</div>
        ) : rowsError ? (
          <div className="px-3 py-2 text-sm text-red-600 dark:text-red-400">{rowsError}</div>
        ) : !rows || rows.length === 0 ? (
          <div className="px-3 py-2 text-sm">
            No record found. Use Mobile device to scan the Answer Sheet of VIT AP University
          </div>
        ) : (
          <table className="w-full text-sm">
            {header}
            <tbody>
              {rows.map((r) => (
                <tr key={r.rollNo} className="border-b border-black/5 dark:border-white/5">
                  <td className="px-3 py-2 align-top whitespace-nowrap">{r.rollNo}</td>
                  <td className="px-3 py-2 align-top">{r.name}</td>
                  <td className="px-3 py-2 align-top">{r.slot}</td>
                  <td className="px-3 py-2 align-top">{r.examType}</td>
                  <td className="px-3 py-2 align-top">{r.totalMarks}</td>
                  <td className="px-3 py-2 align-top">{r.answer1 ?? "-"}</td>
                  <td className="px-3 py-2 align-top">{r.answer2 ?? "-"}</td>
                  <td className="px-3 py-2 align-top">{r.answer3 ?? "-"}</td>
                  <td className="px-3 py-2 align-top">{r.answer4 ?? "-"}</td>
                  <td className="px-3 py-2 align-top">{r.answer5 ?? "-"}</td>
                  <td className="px-3 py-2 align-top">{r.answer6 ?? "-"}</td>
                  <td className="px-3 py-2 align-top">{r.answer7 ?? "-"}</td>
                  <td className="px-3 py-2 align-top">{r.answer8 ?? "-"}</td>
                  <td className="px-3 py-2 align-top">{r.answer9 ?? "-"}</td>
                  <td className="px-3 py-2 align-top">{r.answer10 ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
