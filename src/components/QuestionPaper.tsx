"use client";

import { useEffect, useState } from "react";

type Item = {
  subject: string;
  slot: string;
  courseCode: string;
  examType?: "CAT" | "FAT" | string;
  questions: Array<{ no: number; text: string }>;
};

export default function QuestionPaper() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/question-paper", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load question papers");
        if (!cancelled) setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load question papers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="w-full flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Question Papers</h2>
      {loading ? (
        <div className="w-full rounded-md border border-black/10 dark:border-white/20 px-3 py-2 text-sm">Loading...</div>
      ) : error ? (
        <div className="w-full rounded-md border border-black/10 dark:border-white/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : !items || items.length === 0 ? (
        <div className="w-full rounded-md border border-black/10 dark:border-white/20 px-3 py-2 text-sm">No record found</div>
      ) : (
        <div className="grid gap-3 w-full">
          {items.map((it, idx) => {
            const key = `${it.courseCode}-${it.slot}-${it.examType ?? ""}-${idx}`;
            const isOpen = !!open[key];
            return (
              <div key={key} className="rounded-md border border-black/10 dark:border-white/20">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex gap-4 text-sm">
                    <div><span className="text-muted-foreground">Subject:</span> <span className="font-medium">{it.subject}</span></div>
                    <div><span className="text-muted-foreground">Slot:</span> <span className="font-medium">{it.slot}</span></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen((prev) => ({ ...prev, [key]: !isOpen }))}
                    className="text-sm rounded-md border border-black/10 dark:border-white/20 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    {isOpen ? "Collapse" : "Expand"}
                  </button>
                </div>
                {isOpen && (
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-sm mb-2">
                      <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
                        <div className="text-muted-foreground">Course Code</div>
                        <div className="font-medium">{it.courseCode}</div>
                      </div>
                      {it.examType ? (
                        <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
                          <div className="text-muted-foreground">Exam Type</div>
                          <div className="font-medium">{it.examType}</div>
                        </div>
                      ) : null}
                      <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
                        <div className="text-muted-foreground">Questions</div>
                        <div className="font-medium">{it.questions.length}</div>
                      </div>
                    </div>
                    <div className="w-full rounded-md border border-black/10 dark:border-white/20">
                      {it.questions.length === 0 ? (
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
                            {it.questions.map((q) => (
                              <tr key={q.no} className="border-b border-black/5 dark:border-white/5">
                                <td className="px-3 py-2 align-top whitespace-nowrap font-medium">{q.no}</td>
                                <td className="px-3 py-2 align-top">{q.text}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
