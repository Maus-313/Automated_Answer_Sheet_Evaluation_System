"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingDots from "@/components/LoadingDots";
import PromptRunner from "@/components/PromptRunner";
import ImageOcr from "@/components/ImageOcr";

const SLOTS = [
  "A1","A2","B1","B2","C1","C2","D1","D2","E1","E2","F1","F2","G1","G2",
];

export type AnswerSheet = {
  rollNo: string;
  name: string;
  slot: string;
  examType: "CAT" | "FAT" | "ASSESSMENT" | string;
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
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [manualAddOpen, setManualAddOpen] = useState(false);
  const [manualSlot, setManualSlot] = useState<string>("");

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

  const filtered = useMemo(() => (rows ?? []).filter((r) => (slotFilter ? r.slot === slotFilter : true)), [rows, slotFilter]);

  function ManualAddForm({ slot, onSuccess }: { slot?: string; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
      slot: slot || '',
      rollNo: '',
      name: '',
      examType: '',
      answers: [{ no: 1, text: '' }]
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
        const answerData: Record<string, string | null> = {};
        formData.answers.forEach(ans => {
          answerData[`answer${ans.no}`] = ans.text || null;
        });

        const selectedSlot = formData.slot || slot;
        const res = await fetch('/answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rollNo: formData.rollNo,
            name: formData.name,
            slot: selectedSlot,
            examType: formData.examType,
            ...answerData
          })
        });
        if (!res.ok) throw new Error('Failed to add');
        onSuccess();
      } catch (error) {
        alert('Failed to add. Please try again.');
      } finally {
        setSaving(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {!slot && (
          <div>
            <label className="block text-sm font-medium mb-1">Slot</label>
            <select
              required
              value={formData.slot}
              onChange={(e) => setFormData(prev => ({ ...prev, slot: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
            >
              <option value="">Select Slot</option>
              {SLOTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Roll No</label>
            <input
              type="text"
              required
              value={formData.rollNo}
              onChange={(e) => setFormData(prev => ({ ...prev, rollNo: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Exam Type</label>
            <select
              required
              value={formData.examType}
              onChange={(e) => setFormData(prev => ({ ...prev, examType: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
            >
              <option value="">Select</option>
              <option value="CAT">CAT</option>
              <option value="FAT">FAT</option>
              <option value="ASSESSMENT">Assessment/Quiz</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Answers</label>
          <div className="space-y-2">
            {formData.answers.map((ans, idx) => (
              <div key={ans.no} className="flex gap-2 items-end">
                <div className="w-12">
                  <label className="block text-xs mb-1">Q{ans.no}</label>
                  <input
                    type="number"
                    min="1"
                    value={ans.no}
                    onChange={(e) => {
                      const newNo = parseInt(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        answers: prev.answers.map(a => a.no === ans.no ? { ...a, no: newNo } : a)
                      }));
                    }}
                    className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
                  />
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Answer text"
                    value={ans.text}
                    onChange={(e) => {
                      const newAnswers = [...formData.answers];
                      newAnswers[idx].text = e.target.value;
                      setFormData(prev => ({ ...prev, answers: newAnswers }));
                    }}
                    className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800 resize-y min-h-[40px]"
                    rows={1}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      answers: prev.answers.filter((_, i) => i !== idx)
                    }));
                  }}
                  className="px-2 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              const nextNo = Math.max(...formData.answers.map(a => a.no)) + 1;
              setFormData(prev => ({
                ...prev,
                answers: [...prev.answers, { no: nextNo, text: '' }]
              }));
            }}
            className="mt-2 text-green-600 hover:text-green-800 text-sm px-3 py-1 rounded border border-green-300 hover:border-green-400"
          >
            + Add Answer
          </button>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Answer Sheet'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <section className="w-full flex flex-col gap-3 rounded-xl p-4 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/70 dark:to-neutral-950 ring-2 ring-emerald-200 dark:ring-emerald-700/70 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Answer Sheets</h2>
          <button
            type="button"
            onClick={() => setAddOpen((v) => !v)}
            className="text-xs sm:text-sm rounded-md px-3 py-1.5 text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all"
          >
            {addOpen ? "Close Add" : "Add with Image/PDF"}
          </button>
          <button
            type="button"
            onClick={() => setManualAddOpen(true)}
            className="text-xs sm:text-sm rounded-md px-3 py-1.5 text-white bg-gradient-to-r from-green-600 to-emerald-600 shadow-md shadow-green-500/30 hover:shadow-lg hover:shadow-green-500/40 hover:scale-[1.02] transition-all"
          >
            Add Manually
          </button>
        </div>
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
      {addOpen && (
        <div className="rounded-md border border-black/10 dark:border-white/20 p-3 bg-white/50 dark:bg-neutral-900/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Add Answer Sheet</h3>
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
              <PromptRunner targetModel="AnswerSheet" />
            </div>
          </div>
        </div>
      )}
      {manualAddOpen && (
        <div className="rounded-md border border-black/10 dark:border-white/20 p-3 bg-white/50 dark:bg-neutral-900/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Manually Add Answer Sheet</h3>
            <button
              type="button"
              onClick={() => setManualAddOpen(false)}
              className="text-xs rounded-md border border-black/10 dark:border-white/20 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
          <ManualAddForm slot={slotFilter || undefined} onSuccess={() => {
            setManualAddOpen(false);
            // Refresh data
            window.location.reload();
          }} />
        </div>
      )}
      <div className="w-full rounded-md border border-black/10 dark:border-white/20">
        {rowsLoading ? (
          <div className="px-3 py-2 text-sm"><LoadingDots /></div>
        ) : rowsError ? (
          <div className="px-3 py-2 text-sm text-red-600 dark:text-red-400">{rowsError}</div>
        ) : !slotFilter ? (
          <div className="px-3 py-2 text-sm">Please Select A Slot</div>
        ) : !rows || rows.length === 0 ? (
          <div className="px-3 py-2 text-sm">No Record Found</div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-2 text-sm">No Record Found</div>
        ) : (
          <div className="grid gap-3 w-full">
            {filtered.map((r) => {
              const key = r.rollNo;
              const isOpen = !!open[key];
              return (
                <div key={key} className="rounded-md border border-black/10 dark:border-white/20">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex gap-4 text-sm">
                      <div><span className="text-muted-foreground">Roll No:</span> <span className="font-medium">{r.rollNo}</span></div>
                      <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{r.name}</span></div>
                      <div><span className="text-muted-foreground">Slot:</span> <span className="font-medium">{r.slot}</span></div>
                      <div><span className="text-muted-foreground">Exam Type:</span> <span className="font-medium">{r.examType}</span></div>
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
                      <div className="w-full rounded-md border border-black/10 dark:border-white/20">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                              <th className="px-3 py-2 text-left font-medium w-16">Q#</th>
                              <th className="px-3 py-2 text-left font-medium">Answer</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[r.answer1, r.answer2, r.answer3, r.answer4, r.answer5, r.answer6, r.answer7, r.answer8, r.answer9, r.answer10].map((ans, idx) => (
                              <tr key={idx} className="border-b border-black/5 dark:border-white/5">
                                <td className="px-3 py-2 align-top whitespace-nowrap font-medium">{idx + 1}</td>
                                <td className="px-3 py-2 align-top">{ans ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
