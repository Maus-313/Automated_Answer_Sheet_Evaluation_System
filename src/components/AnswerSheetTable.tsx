"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingDots from "@/components/LoadingDots";

const SLOTS = [
  "A1","A2","B1","B2","C1","C2","D1","D2","E1","E2","F1","F2","G1","G2",
];

export type AnswerSheet = {
  rollNo: string;
  name: string;
  slot: string;
  examType: "CAT" | "FAT" | string;
  totalMarks: number;
  answer1?: string | null;
  answer2?: string | null;
  answer3?: string | null;
  answer4?: string | null;
  answer5?: string | null;
  answer6?: string | null;
  answer7?: string | null;
  answer8?: string | null;
  answer9?: string | null;
  answer10?: string | null;
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
  const [slotFilter, setSlotFilter] = useState<string>("");

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
    <section className="w-full flex flex-col gap-3 rounded-xl p-4 border border-black/10 dark:border-white/10 bg-emerald-50 dark:bg-emerald-900">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Answer Sheets</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="as-slot" className="text-sm text-muted-foreground">Slot</label>
          <select
            id="as-slot"
            className="text-sm rounded-md border border-black/10 dark:border-white/20 px-2 py-1 pr-7 bg-white text-black dark:bg-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/40"
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
          >
            <option value="">Select</option>
            {SLOTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="w-full rounded-md border border-black/10 dark:border-white/20">
        {rowsLoading ? (
          <div className="px-3 py-2 text-sm"><LoadingDots /></div>
        ) : rowsError ? (
          <div className="px-3 py-2 text-sm text-red-600 dark:text-red-400">{rowsError}</div>
        ) : !slotFilter ? (
          <div className="px-3 py-2 text-sm">Please Select A Slot</div>
        ) : !rows || rows.length === 0 ? (
          <div className="px-3 py-2 text-sm">No Record Found</div>
        ) : (rows ?? []).filter((r) => (slotFilter ? r.slot === slotFilter : true)).length === 0 ? (
          <div className="px-3 py-2 text-sm">No Record Found</div>
        ) : (
          <table className="w-full text-sm">
            {header}
            <tbody>
              {(rows ?? []).filter((r) => (slotFilter ? r.slot === slotFilter : true)).map((r) => (
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
