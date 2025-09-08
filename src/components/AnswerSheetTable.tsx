"use client";

import { useEffect, useMemo, useState } from "react";

export type AnswerSheet = {
  id: string;
  rollNo: string;
  name: string;
  slot: string;
  examDate: string; // ISO string from API
  examType: string;
  answers: unknown;
  createdAt: string; // ISO
  updatedAt: string; // ISO
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
          <th className="px-3 py-2 text-left text-sm font-medium">ID</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Roll No</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Name</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Slot</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Exam Date</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Exam Type</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Answers</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Created</th>
          <th className="px-3 py-2 text-left text-sm font-medium">Updated</th>
        </tr>
      </thead>
    ),
    []
  );

  return (
    <section className="w-full flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Answer Sheets</h2>
      <div className="w-full overflow-auto rounded-md border border-black/10 dark:border-white/20">
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
                <tr key={r.id} className="border-b border-black/5 dark:border-white/5">
                  <td className="px-3 py-2 align-top break-all">{r.id}</td>
                  <td className="px-3 py-2 align-top">{r.rollNo}</td>
                  <td className="px-3 py-2 align-top">{r.name}</td>
                  <td className="px-3 py-2 align-top">{r.slot}</td>
                  <td className="px-3 py-2 align-top">{fmt(r.examDate)}</td>
                  <td className="px-3 py-2 align-top">{r.examType}</td>
                  <td className="px-3 py-2 align-top whitespace-pre-wrap">
                    {(() => {
                      try {
                        const s = JSON.stringify(r.answers, null, 2);
                        return s.length > 400 ? s.slice(0, 400) + "…" : s;
                      } catch {
                        return String(r.answers);
                      }
                    })()}
                  </td>
                  <td className="px-3 py-2 align-top">{fmt(r.createdAt)}</td>
                  <td className="px-3 py-2 align-top">{fmt(r.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

