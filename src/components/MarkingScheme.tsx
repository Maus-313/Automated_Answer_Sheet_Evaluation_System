"use client";

import { useEffect, useMemo, useState } from "react";

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
    examType?: "CAT" | "FAT" | string;
    items: MarkSchemeItem[];
  } | null>(hasProps ? { courseCode: props.courseCode, examType: props.examType, items: props.items || [] } : null);

  const [loading, setLoading] = useState(!hasProps);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasProps) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/marking-scheme", { cache: "no-store" });
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
  }, [hasProps]);

  const courseCode = item?.courseCode ?? props.courseCode;
  const examType = item?.examType ?? props.examType;
  const items = item?.items ?? props.items ?? [];
  const total = useMemo(() => items.reduce((sum, i) => sum + (i.marks || 0), 0), [items]);

  return (
    <section className="w-full flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Marking Scheme</h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
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
