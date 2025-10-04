"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingDots from "@/components/LoadingDots";
import PromptRunner from "@/components/PromptRunner";
import ImageOcr from "@/components/ImageOcr";

const SLOTS = [
  "A1","A2","B1","B2","C1","C2","D1","D2","E1","E2","F1","F2","G1","G2",
];

type MarkSchemeItem = { no: number; marks: number; criteria?: string };
type MarkingSchemeProps = Partial<{
  courseCode: string;
  examType: "CAT" | "FAT" | "ASSESSMENT" | string;
  items: MarkSchemeItem[];
}>;

export default function MarkingScheme(props: MarkingSchemeProps) {
  const hasProps = !!props?.courseCode || !!props?.items?.length;
  const [item, setItem] = useState<{
    courseCode?: string;
    slot?: string;
    examType?: "CAT" | "FAT" | "ASSESSMENT" | string;
    items: MarkSchemeItem[];
  } | null>(hasProps ? { courseCode: props.courseCode, examType: props.examType, items: props.items || [] } : null);

  const [loading, setLoading] = useState(!hasProps);
  const [error, setError] = useState<string | null>(null);
  const [slot, setSlot] = useState<string>("");
  const [addOpen, setAddOpen] = useState(false);
  const [manualAddOpen, setManualAddOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState<{
    courseCode: string;
    slot: string;
    examType: "CAT" | "FAT" | "ASSESSMENT" | string;
    items: MarkSchemeItem[];
  } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (hasProps) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        if (!slot) {
          // Wait for a slot selection
          setItem(null);
          setLoading(false);
          return;
        }
        const qs = `?slot=${encodeURIComponent(slot)}`;
        const res = await fetch(`/marking-scheme${qs}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load marking scheme");
        if (!cancelled) setItem(data?.item ?? null);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load marking scheme");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasProps, slot]);

  const courseCode = item?.courseCode ?? props.courseCode;
  const slotValue = item?.slot ?? slot;
  const examType = item?.examType ?? props.examType;
  const items = item?.items ?? props.items ?? [];
  const total = useMemo(() => items.reduce((sum, i) => sum + (i.marks || 0), 0), [items]);

  function ManualAddForm({ slot, onSuccess }: { slot: string; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
      courseCode: '',
      examType: '',
      items: [{ no: 1, marks: 0, criteria: '' }]
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
        const marks: Record<number, number> = {};
        const criteria: Record<number, string> = {};
        formData.items.forEach(item => {
          marks[item.no] = item.marks;
          criteria[item.no] = item.criteria;
        });

        const res = await fetch('/marking-scheme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseCode: formData.courseCode,
            slot,
            examType: formData.examType,
            marks,
            criteria
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Course Code</label>
            <input
              type="text"
              required
              value={formData.courseCode}
              onChange={(e) => setFormData(prev => ({ ...prev, courseCode: e.target.value }))}
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
          <label className="block text-sm font-medium mb-2">Marking Items</label>
          <div className="space-y-2">
            {formData.items.map((item, idx) => (
              <div key={item.no} className="flex gap-2 items-end">
                <div className="w-12">
                  <label className="block text-xs mb-1">Q{item.no}</label>
                  <input
                    type="number"
                    min="1"
                    value={item.no}
                    onChange={(e) => {
                      const newNo = parseInt(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        items: prev.items.map(it => it.no === item.no ? { ...it, no: newNo } : it)
                      }));
                    }}
                    className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
                  />
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Criteria"
                    value={item.criteria}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[idx].criteria = e.target.value;
                      setFormData(prev => ({ ...prev, items: newItems }));
                    }}
                    className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800 resize-y min-h-[40px]"
                    rows={1}
                  />
                </div>
                <div className="w-16">
                  <input
                    type="number"
                    min="0"
                    placeholder="Marks"
                    value={item.marks}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[idx].marks = parseInt(e.target.value) || 0;
                      setFormData(prev => ({ ...prev, items: newItems }));
                    }}
                    className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      items: prev.items.filter((_, i) => i !== idx)
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
              const nextNo = Math.max(...formData.items.map(i => i.no)) + 1;
              setFormData(prev => ({
                ...prev,
                items: [...prev.items, { no: nextNo, marks: 0, criteria: '' }]
              }));
            }}
            className="mt-2 text-green-600 hover:text-green-800 text-sm px-3 py-1 rounded border border-green-300 hover:border-green-400"
          >
            + Add Item
          </button>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Marking Scheme'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <section className="w-full flex flex-col gap-3 rounded-xl p-4 bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/70 dark:to-neutral-950 ring-2 ring-amber-200 dark:ring-amber-700/70 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Marking Scheme</h2>
          {item && (
            <button
              type="button"
              onClick={() => {
                if (editing) {
                  setEditedData(null);
                  setHasChanges(false);
                } else {
                  setEditedData({
                    courseCode: courseCode || '',
                    slot: slotValue || '',
                    examType: examType || '',
                    items: [...items]
                  });
                }
                setEditing(!editing);
              }}
              className="text-xs sm:text-sm rounded-md px-3 py-1.5 text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
            >
              {editing ? "Cancel Edit" : "Edit"}
            </button>
          )}
          {item && (
            <button
              type="button"
              disabled={deleting}
              onClick={async () => {
                if (!confirm(`Are you sure you want to delete the marking scheme for ${courseCode} (${examType}) in slot ${slotValue}?`)) return;
                setDeleting(true);
                try {
                  const qs = new URLSearchParams({
                    courseCode: courseCode || '',
                    slot: slotValue || '',
                    examType: examType || ''
                  });
                  const res = await fetch(`/marking-scheme?${qs.toString()}`, {
                    method: 'DELETE'
                  });
                  if (!res.ok) throw new Error('Failed to delete');
                  // Clear local state
                  setItem(null);
                } catch (error) {
                  console.error('Failed to delete:', error);
                  alert('Failed to delete. Please try again.');
                } finally {
                  setDeleting(false);
                }
              }}
              className="text-xs sm:text-sm rounded-md px-3 py-1.5 text-white bg-gradient-to-r from-red-600 to-red-700 shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setAddOpen((v) => !v)}
            className="text-xs sm:text-sm rounded-md px-3 py-1.5 text-white bg-gradient-to-r from-amber-600 to-orange-600 shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 hover:scale-[1.02] transition-all"
          >
            {addOpen ? "Close Add" : "Add with Image/PDF"}
          </button>
        </div>
        {!hasProps ? (
          <div className="flex items-center gap-2">
            <label htmlFor="ms-slot" className="text-sm text-muted-foreground">Slot</label>
            <select
              id="ms-slot"
              className="text-sm rounded-md border border-black/10 dark:border-white/20 px-2 py-1 pr-7 bg-white text-black dark:bg-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/40"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
            >
              <option value="">Select</option>
              {SLOTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
      {addOpen && (
        <div className="rounded-md border border-black/10 dark:border-white/20 p-3 bg-white/50 dark:bg-neutral-900/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Add Marking Scheme</h3>
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
              <PromptRunner targetModel="MarkingScheme" />
            </div>
          </div>
        </div>
      )}
      {manualAddOpen && (
        <div className="rounded-md border border-black/10 dark:border-white/20 p-3 bg-white/50 dark:bg-neutral-900/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Manually Add Marking Scheme</h3>
            <button
              type="button"
              onClick={() => setManualAddOpen(false)}
              className="text-xs rounded-md border border-black/10 dark:border-white/20 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
          <ManualAddForm slot={slot} onSuccess={() => {
            setManualAddOpen(false);
            // Refresh data
            window.location.reload();
          }} />
        </div>
      )}
      {loading || error || !item && !hasProps ? (
        <div className="w-full rounded-md border border-black/10 dark:border-white/20">
          {loading ? (
            <div className="px-3 py-2 text-sm"><LoadingDots /></div>
          ) : error ? (
            <div className="px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>
          ) : !slot ? (
            <div className="px-3 py-2 text-sm">Please Select A Slot</div>
          ) : (
            <div className="px-3 py-2 text-sm">No Record Found</div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-sm">
            <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
              <div className="text-muted-foreground">Course Code</div>
              {editing ? (
                <input
                  type="text"
                  value={editedData?.courseCode || ''}
                  onChange={(e) => {
                    setEditedData(prev => prev ? { ...prev, courseCode: e.target.value } : null);
                    setHasChanges(true);
                  }}
                  className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
                />
              ) : (
                <div className="font-medium">{courseCode}</div>
              )}
            </div>
            <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
              <div className="text-muted-foreground">Slot</div>
              {editing ? (
                <select
                  value={editedData?.slot || ''}
                  onChange={(e) => {
                    setEditedData(prev => prev ? { ...prev, slot: e.target.value } : null);
                    setHasChanges(true);
                  }}
                  className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
                >
                  {SLOTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <div className="font-medium">{slotValue}</div>
              )}
            </div>
            <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
              <div className="text-muted-foreground">Exam Type</div>
              {editing ? (
                <select
                  value={editedData?.examType || ''}
                  onChange={(e) => {
                    setEditedData(prev => prev ? { ...prev, examType: e.target.value } : null);
                    setHasChanges(true);
                  }}
                  className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
                >
                  <option value="CAT">CAT</option>
                  <option value="FAT">FAT</option>
                  <option value="ASSESSMENT">Assessment/Quiz</option>
                </select>
              ) : (
                <div className="font-medium">{examType}</div>
              )}
            </div>
            <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
              <div className="text-muted-foreground">Total Marks</div>
              <div className="font-medium">{editing ? (editedData?.items.reduce((sum, i) => sum + (i.marks || 0), 0) || 0) : total}</div>
            </div>
          </div>

          <div className="w-full rounded-md border border-black/10 dark:border-white/20">
            {(editing ? editedData?.items || [] : items).length === 0 ? (
              <div className="px-3 py-2 text-sm">No marking items provided</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                    <th className="px-3 py-2 text-left font-medium w-16">Q#</th>
                    <th className="px-3 py-2 text-left font-medium">Criteria</th>
                    <th className="px-3 py-2 text-left font-medium w-24">Marks</th>
                    {editing && <th className="px-3 py-2 text-left font-medium w-16">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {(editing ? editedData?.items || [] : items).map((m) => (
                    <tr key={m.no} className="border-b border-black/5 dark:border-white/5">
                      <td className="px-3 py-2 align-top whitespace-nowrap font-medium">{m.no}</td>
                      <td className="px-3 py-2 align-top">
                        {editing ? (
                          <textarea
                            value={m.criteria || ''}
                            onChange={(e) => {
                              const updatedItems = editedData?.items.map(item =>
                                item.no === m.no ? { ...item, criteria: e.target.value } : item
                              );
                              setEditedData(prev => prev ? { ...prev, items: updatedItems || [] } : null);
                              setHasChanges(true);
                            }}
                            className="w-full px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800 resize-y min-h-[60px]"
                            rows={2}
                          />
                        ) : (
                          <span className="text-pretty">{m.criteria ?? "—"}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        {editing ? (
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={m.marks}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              const updatedItems = editedData?.items.map(item =>
                                item.no === m.no ? { ...item, marks: value } : item
                              );
                              setEditedData(prev => prev ? { ...prev, items: updatedItems || [] } : null);
                              setHasChanges(true);
                            }}
                            className="w-16 px-2 py-1 text-sm border border-black/20 dark:border-white/30 rounded bg-white dark:bg-neutral-800"
                          />
                        ) : (
                          m.marks
                        )}
                      </td>
                      {editing && (
                        <td className="px-3 py-2 align-top">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedItems = editedData?.items.filter(item => item.no !== m.no) || [];
                              setEditedData(prev => prev ? { ...prev, items: updatedItems } : null);
                              setHasChanges(true);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded border border-red-300 hover:border-red-400"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {editing && (
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const currentItems = editedData?.items || [];
                            const nextNo = Math.max(...currentItems.map(i => i.no), 0) + 1;
                            const updatedItems = [...currentItems, { no: nextNo, marks: 0, criteria: '' }];
                            setEditedData(prev => prev ? { ...prev, items: updatedItems } : null);
                            setHasChanges(true);
                          }}
                          className="text-green-600 hover:text-green-800 text-sm px-3 py-1 rounded border border-green-300 hover:border-green-400"
                        >
                          + Add Criteria
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          {editing && (
            <div className="flex justify-end mt-3">
              <button
                type="button"
                disabled={!hasChanges || updating}
                onClick={async () => {
                  if (!editedData || !hasChanges) return;

                  setUpdating(true);
                  try {
                    const marks: Record<number, number> = {};
                    const criteria: Record<number, string> = {};

                    // Clear all fields first
                    for (let i = 1; i <= 10; i++) {
                      marks[i] = 0;
                      criteria[i] = '';
                    }

                    // Set values for existing items
                    editedData.items.forEach(item => {
                      marks[item.no] = item.marks;
                      criteria[item.no] = item.criteria || '';
                    });

                    const response = await fetch('/marking-scheme', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        originalCourseCode: courseCode,
                        originalExamType: examType,
                        courseCode: editedData.courseCode,
                        slot: editedData.slot,
                        examType: editedData.examType,
                        marks,
                        criteria
                      })
                    });

                    if (!response.ok) throw new Error('Failed to update');

                    // Update local state
                    setItem({
                      courseCode: editedData.courseCode,
                      slot: editedData.slot,
                      examType: editedData.examType,
                      items: editedData.items
                    });

                    setHasChanges(false);
                    setEditing(false);
                    setEditedData(null);
                  } catch (error) {
                    console.error('Failed to update:', error);
                    alert('Failed to update. Please try again.');
                  } finally {
                    setUpdating(false);
                  }
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  hasChanges
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {updating ? 'Updating...' : 'Update Scheme'}
              </button>
            </div>
          )}
        </>
      )}
      {slot && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => setManualAddOpen(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm shadow-md"
          >
            + Manually Add Marking Scheme
          </button>
        </div>
      )}
    </section>
  );
}
