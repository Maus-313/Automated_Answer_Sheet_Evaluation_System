"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingDots from "@/components/LoadingDots";

const SLOTS = [
  "A1","A2","B1","B2","C1","C2","D1","D2","E1","E2","F1","F2","G1","G2",
];

type MarkSchemeItem = { no: number; marks: number; criteria?: string };
type MarkingSchemeProps = Partial<{
  courseCode: string;
  examType: "CAT" | "FAT" | string;
  items: MarkSchemeItem[];
}>;

export default function MarkingScheme(props: MarkingSchemeProps) {
  const hasProps = !!props?.courseCode || !!props?.items?.length;
  const [item, setItem] = useState<{
    courseCode?: string;
    slot?: string;
    examType?: "CAT" | "FAT" | string;
    items: MarkSchemeItem[];
  } | null>(hasProps ? { courseCode: props.courseCode, examType: props.examType, items: props.items || [] } : null);

  const [loading, setLoading] = useState(!hasProps);
  const [error, setError] = useState<string | null>(null);
  const [slot, setSlot] = useState<string>("");

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

  return (
    <section className="w-full flex flex-col gap-3 rounded-xl p-4 border border-black/10 dark:border-white/10 bg-amber-50 dark:bg-amber-900/20">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Marking Scheme</h2>
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
      {loading || error || !item && !hasProps ? (
        <div className="w-full rounded-md border border-black/10 dark:border-white/20">
          {loading ? (
            <div className="px-3 py-4 flex items-center justify-center"><LoadingDots /></div>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
              <div className="text-muted-foreground">Course Code</div>
              <div className="font-medium">{courseCode}</div>
            </div>
            {slotValue ? (
              <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
                <div className="text-muted-foreground">Slot</div>
                <div className="font-medium">{slotValue}</div>
              </div>
            ) : null}
            {examType ? (
              <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
                <div className="text-muted-foreground">Exam Type</div>
                <div className="font-medium">{examType}</div>
              </div>
            ) : null}
            <div className="rounded-md border border-black/10 dark:border-white/20 p-2">
              <div className="text-muted-foreground">Total Marks</div>
              <div className="font-medium">{total}</div>
            </div>
          </div>

          <div className="w-full rounded-md border border-black/10 dark:border-white/20">
            {items.length === 0 ? (
              <div className="px-3 py-2 text-sm">No marking items provided</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                    <th className="px-3 py-2 text-left font-medium w-16">Q#</th>
                    <th className="px-3 py-2 text-left font-medium">Criteria</th>
                    <th className="px-3 py-2 text-left font-medium w-24">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((m) => (
                    <tr key={m.no} className="border-b border-black/5 dark:border-white/5">
                      <td className="px-3 py-2 align-top whitespace-nowrap font-medium">{m.no}</td>
                      <td className="px-3 py-2 align-top text-pretty">{m.criteria ?? "—"}</td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">{m.marks}</td>
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
