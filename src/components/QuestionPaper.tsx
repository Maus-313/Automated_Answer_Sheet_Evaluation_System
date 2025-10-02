"use client";

import { useEffect, useState } from "react";
import LoadingDots from "@/components/LoadingDots";
import PromptRunner from "@/components/PromptRunner";
import ImageOcr from "@/components/ImageOcr";

const SLOTS = [
  "A1","A2","B1","B2","C1","C2","D1","D2","E1","E2","F1","F2","G1","G2",
];

type Item = {
  subject: string;
  slot: string;
  courseCode: string;
  examType?: "CAT" | "FAT" | string;
  questions: Array<{ no: number; text: string; marks: number | null }>;
  totalMarks: number;
};

export default function QuestionPaper() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [slotFilter, setSlotFilter] = useState<string>("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [editedMarks, setEditedMarks] = useState<Record<string, Record<number, number>>>({});
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!slotFilter) {
          // Behave like "Select None": don't fetch until a slot is chosen
          if (!cancelled) {
            setItems(null);
            setLoading(false);
          }
          return;
        }
        setLoading(true);
        const qs = `?slot=${encodeURIComponent(slotFilter)}`;
        const res = await fetch(`/question-paper${qs}`, { cache: "no-store" });
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
  }, [slotFilter]);

  const slots = SLOTS;
  const filtered = (items ?? []).filter((i) => (slotFilter ? i.slot === slotFilter : true));

  return (
    <section className="w-full flex flex-col gap-3 rounded-xl p-4 bg-gradient-to-b from-sky-50 to-white dark:from-sky-900/70 dark:to-neutral-950 ring-2 ring-sky-200 dark:ring-sky-700/70 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Question Papers</h2>
          <button
            type="button"
            onClick={() => setAddOpen((v) => !v)}
            className="text-xs sm:text-sm rounded-md px-3 py-1.5 text-white bg-gradient-to-r from-sky-600 to-blue-600 shadow-md shadow-sky-500/30 hover:shadow-lg hover:shadow-sky-500/40 hover:scale-[1.02] transition-all"
          >
            {addOpen ? "Close Add" : "+ Add"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="qp-slot" className="text-sm text-muted-foreground">Slot</label>
          <select
            id="qp-slot"
            className="text-sm rounded-md border border-black/10 dark:border-white/20 px-2 py-1 pr-7 bg-white text-black dark:bg-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/40"
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
          >
            <option value="">Select</option>
            {slots.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      {addOpen && (
        <div className="rounded-md border border-black/10 dark:border-white/20 p-3 bg-white/50 dark:bg-neutral-900/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Add Question Paper</h3>
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="text-xs rounded-md border border-black/10 dark:border-white/20 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="min-w-0">
              <ImageOcr />
            </div>
            <div className="min-w-0">
              <PromptRunner targetModel="QuestionPaper" />
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="w-full rounded-md border border-black/10 dark:border-white/20 px-3 py-2 text-sm"><LoadingDots /></div>
      ) : error ? (
        <div className="w-full rounded-md border border-black/10 dark:border-white/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : !slotFilter ? (
        <div className="w-full rounded-md border border-black/10 dark:border-white/20 px-3 py-2 text-sm">Please Select A Slot</div>
      ) : !items || items.length === 0 ? (
        <div className="w-full rounded-md border border-black/10 dark:border-white/20 px-3 py-2 text-sm">No Record Found</div>
      ) : filtered.length === 0 ? (
        <div className="w-full rounded-md border border-black/10 dark:border-white/20 px-3 py-2 text-sm">No Record Found</div>
      ) : (
        <div className="grid gap-3 w-full">
          {filtered.map((it, idx) => {
            const key = `${it.courseCode}-${it.slot}-${it.examType ?? ""}-${idx}`;
            const isOpen = !!open[key];
            return (
              <div key={key} className="rounded-md border border-black/10 dark:border-white/20">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex gap-4 text-sm">
                    <div><span className="text-muted-foreground">Subject:</span> <span className="font-medium">{it.subject}</span></div>
                    <div><span className="text-muted-foreground">Slot:</span> <span className="font-medium">{it.slot}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (editing[key]) {
                          // Cancel editing - reset changes
                          setEditedMarks(prev => {
                            const newState = { ...prev };
                            delete newState[key];
                            return newState;
                          });
                          setHasChanges(prev => ({ ...prev, [key]: false }));
                        }
                        setEditing((prev) => ({ ...prev, [key]: !prev[key] }));
                      }}
                      className="text-sm rounded-md border border-black/10 dark:border-white/20 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      {editing[key] ? "Cancel Edit" : "Edit Marks"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen((prev) => ({ ...prev, [key]: !isOpen }))}
                      className="text-sm rounded-md border border-black/10 dark:border-white/20 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      {isOpen ? "Collapse" : "Expand"}
                    </button>
                  </div>
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
                      <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
                        <div className="text-muted-foreground">Total Marks</div>
                        <div className="font-medium">{it.totalMarks}</div>
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
                              <th className="px-3 py-2 text-left font-medium w-20">Marks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {it.questions.map((q) => (
                              <tr key={q.no} className="border-b border-black/5 dark:border-white/5">
                                <td className="px-3 py-2 align-top whitespace-nowrap font-medium">{q.no}</td>
                                <td className="px-3 py-2 align-top">{q.text}</td>
                                <td className="px-3 py-2 align-top whitespace-nowrap">
                                  {editing[key] ? (
                                    <input
                                      type="number"
                                      min="0"
                                      max="50"
                                      value={editedMarks[key]?.[q.no] ?? (q.marks ?? 0)}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        setEditedMarks(prev => ({
                                          ...prev,
                                          [key]: { ...prev[key], [q.no]: value }
                                        }));
                                        setHasChanges(prev => ({ ...prev, [key]: true }));
                                      }}
                                      className="w-16 px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
                                    />
                                  ) : (
                                    q.marks !== null ? q.marks : "—"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      {editing[key] && (
                        <div className="flex justify-end mt-3">
                          <button
                            type="button"
                            disabled={updating[key]}
                            onClick={async () => {
                              if (!hasChanges[key]) return;

                              setUpdating(prev => ({ ...prev, [key]: true }));
                              try {
                                const marks: Record<number, number> = {};
                                it.questions.forEach(q => {
                                  marks[q.no] = editedMarks[key]?.[q.no] ?? (q.marks ?? 0);
                                });

                                const totalMarks = Object.values(marks).reduce((sum, mark) => sum + mark, 0);

                                // Find the question paper ID - we need to get it from somewhere
                                // For now, we'll need to modify the API to accept courseCode, slot, examType instead
                                const response = await fetch('/question-paper', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    courseCode: it.courseCode,
                                    slot: it.slot,
                                    examType: it.examType,
                                    marks,
                                    totalMarks
                                  })
                                });

                                if (!response.ok) throw new Error('Failed to update marks');

                                // Update local state
                                setItems(prev => prev ? prev.map(item =>
                                  item.courseCode === it.courseCode &&
                                  item.slot === it.slot &&
                                  item.examType === it.examType
                                    ? {
                                        ...item,
                                        questions: item.questions.map(q => ({
                                          ...q,
                                          marks: marks[q.no]
                                        })),
                                        totalMarks
                                      }
                                    : item
                                ) : null);

                                setHasChanges(prev => ({ ...prev, [key]: false }));
                                setEditing(prev => ({ ...prev, [key]: false }));
                                const newEditedMarks = { ...editedMarks };
                                delete newEditedMarks[key];
                                setEditedMarks(newEditedMarks);
                              } catch (error) {
                                console.error('Failed to update marks:', error);
                                alert('Failed to update marks. Please try again.');
                              } finally {
                                setUpdating(prev => ({ ...prev, [key]: false }));
                              }
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                              hasChanges[key]
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {updating[key] ? 'Updating...' : 'Update Marks'}
                          </button>
                        </div>
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
