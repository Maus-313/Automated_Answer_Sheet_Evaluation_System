"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingDots from "@/components/LoadingDots";
import { exportToExcel, exportToCSV } from "@/lib/utils";
import { Download } from "lucide-react";

const SLOTS = [
  "A1","A2","B1","B2","C1","C2","D1","D2","E1","E2","F1","F2","G1","G2",
];

export type MarkingSheet = {
  rollNo: string;
  name: string;
  slot: string;
  examType: "CAT" | "FAT" | "ASSESSMENT" | string;
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

export default function MarkSheetTable() {
  const [rows, setRows] = useState<MarkingSheet[] | null>(null);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [rowsError, setRowsError] = useState<string | null>(null);
  const [slotFilter, setSlotFilter] = useState<string>("");
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [editedMarks, setEditedMarks] = useState<Record<string, Record<number, number>>>({});
  const [editedData, setEditedData] = useState<Record<string, Partial<MarkingSheet>>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!slotFilter) {
          // Behave like "Select None": don't fetch until a slot is chosen
          if (!cancelled) {
            setRows(null);
            setRowsLoading(false);
          }
          return;
        }
        setRowsLoading(true);
        const qs = `?slot=${encodeURIComponent(slotFilter)}`;
        const res = await fetch(`/marking-sheets${qs}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load marking sheets");
        if (!cancelled) setRows(Array.isArray(data?.items) ? data.items : []);
      } catch (e: any) {
        if (!cancelled) setRowsError(e?.message || "Failed to load marking sheets");
      } finally {
        if (!cancelled) setRowsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slotFilter]);

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
          <th className="px-3 py-2 text-left text-sm font-medium">Actions</th>
        </tr>
      </thead>
    ),
    []
  );

  const filtered = (rows ?? []).filter((r) => (slotFilter ? r.slot === slotFilter : false));

  return (
    <section className="w-full flex flex-col gap-3 rounded-xl p-4 bg-gradient-to-b from-violet-50 to-white dark:from-violet-900/70 dark:to-neutral-950 ring-2 ring-violet-200 dark:ring-violet-700/70 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Evaluated Mark Sheet</h2>
        <div className="flex items-center gap-2">
          {filtered.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => await exportToExcel(filtered, `MarkSheet_${slotFilter}`)}
                className="flex items-center gap-1 text-xs sm:text-sm rounded-md px-3 py-1.5 text-white bg-gradient-to-r from-green-600 to-emerald-600 shadow-md shadow-green-500/30 hover:shadow-lg hover:shadow-green-500/40 hover:scale-[1.02] transition-all"
              >
                <Download className="h-3 w-3" />
                Excel
              </button>
              <button
                type="button"
                onClick={async () => await exportToCSV(filtered, `MarkSheet_${slotFilter}`)}
                className="flex items-center gap-1 text-xs sm:text-sm rounded-md px-3 py-1.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
              >
                <Download className="h-3 w-3" />
                CSV
              </button>
            </div>
          )}
          <label htmlFor="mslot" className="text-sm text-muted-foreground">Slot</label>
          <select
            id="mslot"
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
        ) : filtered.length === 0 ? (
          <div className="px-3 py-2 text-sm">No Record Found</div>
        ) : (
          <table className="w-full text-sm">
            {header}
            <tbody>
              {filtered.map((r) => {
                const isEditing = editing[r.rollNo];
                return (
                  <tr key={r.rollNo} className="border-b border-black/5 dark:border-white/5">
                    <td className="px-3 py-2 align-top whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData[r.rollNo]?.rollNo ?? r.rollNo}
                          onChange={(e) => setEditedData(prev => ({
                            ...prev,
                            [r.rollNo]: { ...prev[r.rollNo], rollNo: e.target.value }
                          }))}
                          className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
                        />
                      ) : (
                        r.rollNo
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData[r.rollNo]?.name ?? r.name}
                          onChange={(e) => setEditedData(prev => ({
                            ...prev,
                            [r.rollNo]: { ...prev[r.rollNo], name: e.target.value }
                          }))}
                          className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
                        />
                      ) : (
                        r.name
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {isEditing ? (
                        <select
                          value={editedData[r.rollNo]?.slot ?? r.slot}
                          onChange={(e) => setEditedData(prev => ({
                            ...prev,
                            [r.rollNo]: { ...prev[r.rollNo], slot: e.target.value }
                          }))}
                          className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
                        >
                          {SLOTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        r.slot
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {isEditing ? (
                        <select
                          value={editedData[r.rollNo]?.examType ?? r.examType}
                          onChange={(e) => setEditedData(prev => ({
                            ...prev,
                            [r.rollNo]: { ...prev[r.rollNo], examType: e.target.value }
                          }))}
                          className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
                        >
                          <option value="CAT">CAT</option>
                          <option value="FAT">FAT</option>
                          <option value="ASSESSMENT">Assessment/Quiz</option>
                        </select>
                      ) : (
                        r.examType
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {isEditing
                        ? [1,2,3,4,5,6,7,8,9,10].reduce((sum, i) => sum + (editedMarks[r.rollNo]?.[i] ?? (r[`answer${i}` as keyof MarkingSheet] as number ?? 0)), 0)
                        : r.totalMarks
                      }
                    </td>
                    {[r.answer1, r.answer2, r.answer3, r.answer4, r.answer5, r.answer6, r.answer7, r.answer8, r.answer9, r.answer10].map((ans, idx) => (
                      <td key={idx} className="px-3 py-2 align-top">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={editedMarks[r.rollNo]?.[idx + 1] ?? (ans ?? 0)}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setEditedMarks(prev => ({
                                ...prev,
                                [r.rollNo]: { ...prev[r.rollNo], [idx + 1]: value }
                              }));
                            }}
                            className="w-12 px-1 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
                          />
                        ) : (
                          ans ?? "-"
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 align-top">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={updating[r.rollNo]}
                            onClick={async () => {
                              setUpdating(prev => ({ ...prev, [r.rollNo]: true }));
                              try {
                                const updates: Record<string, number | null | string> = {};
                                for (let i = 1; i <= 10; i++) {
                                  updates[`answer${i}`] = editedMarks[r.rollNo]?.[i] ?? r[`answer${i}` as keyof MarkingSheet] as number ?? null;
                                }
                                const newData = editedData[r.rollNo];
                                if (newData) {
                                  if (newData.rollNo) updates.rollNo = newData.rollNo;
                                  if (newData.name) updates.name = newData.name;
                                  if (newData.slot) updates.slot = newData.slot;
                                  if (newData.examType) updates.examType = newData.examType;
                                }
                                const res = await fetch('/marking-sheets', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    originalRollNo: r.rollNo,
                                    ...updates
                                  })
                                });
                                if (!res.ok) throw new Error('Failed to update');
                                const data = await res.json();
                                // Update local state
                                setRows(prev => {
                                  if (!prev) return null;
                                  const filtered = prev.filter(row => row.rollNo !== r.rollNo);
                                  return [...filtered, data.item];
                                });
                                setEditing(prev => ({ ...prev, [r.rollNo]: false }));
                                setEditedMarks(prev => {
                                  const newState = { ...prev };
                                  delete newState[r.rollNo];
                                  return newState;
                                });
                                setEditedData(prev => {
                                  const newState = { ...prev };
                                  delete newState[r.rollNo];
                                  return newState;
                                });
                              } catch (error) {
                                console.error('Failed to update:', error);
                                alert('Failed to update. Please try again.');
                              } finally {
                                setUpdating(prev => ({ ...prev, [r.rollNo]: false }));
                              }
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50"
                          >
                            {updating[r.rollNo] ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(prev => ({ ...prev, [r.rollNo]: false }));
                              setEditedMarks(prev => {
                                const newState = { ...prev };
                                delete newState[r.rollNo];
                                return newState;
                              });
                              setEditedData(prev => {
                                const newState = { ...prev };
                                delete newState[r.rollNo];
                                return newState;
                              });
                            }}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditing(prev => ({ ...prev, [r.rollNo]: true }))}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
