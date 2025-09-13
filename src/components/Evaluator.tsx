"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import LoadingDots from "@/components/LoadingDots";

const SLOTS = ["A1","A2","B1","B2","C1","C2","D1","D2","E1","E2","F1","F2","G1","G2"] as const;

type QPItem = {
  subject: string;
  slot: string;
  courseCode: string;
  examType?: string;
  questions: Array<{ no: number; text: string }>;
};

type ASRow = {
  rollNo: string;
  name: string;
  slot: string;
  examType: string;
  totalMarks: number;
};

type MSItem = {
  courseCode: string;
  slot?: string;
  examType?: string;
  items: Array<{ no: number; marks?: number; criteria?: string }>;
};

export default function Evaluator() {
  const [slot, setSlot] = useState<string>("");

  const [qps, setQps] = useState<QPItem[] | null>(null);
  const [qpsLoading, setQpsLoading] = useState(false);
  const [qpsError, setQpsError] = useState<string | null>(null);
  const [selectedQpIdx, setSelectedQpIdx] = useState<string>("");

  const [answers, setAnswers] = useState<ASRow[] | null>(null);
  const [ansLoading, setAnsLoading] = useState(false);
  const [ansError, setAnsError] = useState<string | null>(null);
  const [selectedAnsIdx, setSelectedAnsIdx] = useState<string>("");

  const [ms, setMs] = useState<MSItem | null>(null);
  const [msLoading, setMsLoading] = useState(false);

  const [view, setView] = useState<{
    qp?: QPItem;
    ms?: MSItem | null;
    as?: ASRow;
  } | null>(null);

  // Load QPs and AS for slot
  useEffect(() => {
    if (!slot) {
      setQps(null); setAnswers(null);
      setSelectedQpIdx(""); setSelectedAnsIdx("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setQpsLoading(true); setAnsLoading(true);
        const [qpRes, asRes] = await Promise.all([
          fetch(`/question-paper?slot=${encodeURIComponent(slot)}`, { cache: "no-store" }),
          fetch(`/answers?slot=${encodeURIComponent(slot)}`, { cache: "no-store" }),
        ]);
        const qpData = await qpRes.json();
        const asData = await asRes.json();
        if (!qpRes.ok) throw new Error(qpData?.error || "Failed to load question papers");
        if (!asRes.ok) throw new Error(asData?.error || "Failed to load answers");
        if (!cancelled) {
          setQps(Array.isArray(qpData?.items) ? qpData.items : []);
          setAnswers(Array.isArray(asData?.items) ? asData.items : []);
          setSelectedQpIdx(""); setSelectedAnsIdx("");
        }
      } catch (e: any) {
        if (!cancelled) {
          setQpsError(e?.message || "Failed to load slot data");
          setAnsError(e?.message || "Failed to load slot data");
        }
      } finally {
        if (!cancelled) { setQpsLoading(false); setAnsLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [slot]);

  // Load MS for selected QP
  useEffect(() => {
    if (!slot || !selectedQpIdx) { setMs(null); return; }
    const qp = qps?.[Number(selectedQpIdx)];
    if (!qp) { setMs(null); return; }
    let cancelled = false;
    (async () => {
      try {
        setMsLoading(true);
        const qs = new URLSearchParams({ slot, courseCode: qp.courseCode, examType: String(qp.examType || "") });
        const res = await fetch(`/marking-scheme?${qs.toString()}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load marking scheme");
        if (!cancelled) setMs(data?.item ?? null);
      } catch {
        if (!cancelled) setMs(null);
      } finally {
        if (!cancelled) setMsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slot, selectedQpIdx]);

  const canEvaluate = !!slot && selectedQpIdx !== "" && selectedAnsIdx !== "";
  const selectedQp = selectedQpIdx !== "" ? qps?.[Number(selectedQpIdx)] : undefined;
  const selectedAns = selectedAnsIdx !== "" ? answers?.[Number(selectedAnsIdx)] : undefined;

  const qpOptions = useMemo(() => (qps ?? []).map((q, i) => ({
    value: String(i),
    label: `${q.courseCode} • ${q.subject}${q.examType ? ` • ${q.examType}` : ""}`,
  })), [qps]);

  const asOptions = useMemo(() => (answers ?? []).map((a, i) => ({
    value: String(i),
    label: `${a.rollNo} • ${a.name}`,
  })), [answers]);

  return (
    <section className="w-full flex flex-col gap-3 rounded-xl p-4 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900/70 dark:to-neutral-950 ring-2 ring-neutral-200 dark:ring-neutral-700/70 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Evaluate (Preview)</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="ev-slot" className="text-sm text-muted-foreground">Slot</label>
          <select
            id="ev-slot"
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-md border border-black/10 dark:border-white/20 p-3">
          <div className="text-sm font-medium mb-2">Question Paper</div>
          {!slot ? (
            <div className="text-sm text-muted-foreground">Please Select A Slot</div>
          ) : qpsLoading ? (
            <div className="text-sm"><LoadingDots /></div>
          ) : qpsError ? (
            <div className="text-sm text-red-600 dark:text-red-400">{qpsError}</div>
          ) : !qps || qps.length === 0 ? (
            <div className="text-sm">No Record Found</div>
          ) : (
            <select
              className="w-full text-sm rounded-md border border-black/10 dark:border-white/20 px-2 py-1 bg-white text-black dark:bg-neutral-900 dark:text-white"
              value={selectedQpIdx}
              onChange={(e) => setSelectedQpIdx(e.target.value)}
            >
              <option value="">Select</option>
              {qpOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )}
        </div>

        <div className="rounded-md border border-black/10 dark:border-white/20 p-3">
          <div className="text-sm font-medium mb-2">Answer Sheet</div>
          {!slot ? (
            <div className="text-sm text-muted-foreground">Please Select A Slot</div>
          ) : ansLoading ? (
            <div className="text-sm"><LoadingDots /></div>
          ) : ansError ? (
            <div className="text-sm text-red-600 dark:text-red-400">{ansError}</div>
          ) : !answers || answers.length === 0 ? (
            <div className="text-sm">No Record Found</div>
          ) : (
            <select
              className="w-full text-sm rounded-md border border-black/10 dark:border-white/20 px-2 py-1 bg-white text-black dark:bg-neutral-900 dark:text-white"
              value={selectedAnsIdx}
              onChange={(e) => setSelectedAnsIdx(e.target.value)}
            >
              <option value="">Select</option>
              {asOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )}
        </div>

        <div className="rounded-md border border-black/10 dark:border-white/20 p-3">
          <div className="text-sm font-medium mb-2">Marking Scheme</div>
          {!slot || !selectedQp ? (
            <div className="text-sm">No Scheme Found: General Sscheme Applied</div>
          ) : msLoading ? (
            <div className="text-sm"><LoadingDots /></div>
          ) : !ms ? (
            <div className="text-sm">No Scheme Found: General Sscheme Applied</div>
          ) : (
            <div className="text-sm text-muted-foreground">Loaded for {ms.courseCode}{ms.examType ? ` • ${ms.examType}` : ""}</div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canEvaluate}
          onClick={() => setView({ qp: selectedQp, ms, as: selectedAns })}
          className="inline-flex items-center gap-2 text-sm rounded-md border border-black/10 dark:border-white/20 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Sparkles className="h-4 w-4" />
          Evaluate
        </button>
      </div>

      {view ? (
        <div className="rounded-md border border-black/10 dark:border-white/20 p-3 text-sm">
          <div className="font-medium mb-2">Selection Preview</div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <div className="text-muted-foreground">Question Paper</div>
              {view.qp ? (
                <div>
                  <div className="font-medium">{view.qp.subject}</div>
                  <div className="text-xs">{view.qp.courseCode} • {view.qp.examType ?? ""} • Slot {view.qp.slot}</div>
                </div>
              ) : <div>—</div>}
            </div>
            <div>
              <div className="text-muted-foreground">Answer Sheet</div>
              {view.as ? (
                <div>
                  <div className="font-medium">{view.as.rollNo}</div>
                  <div className="text-xs">{view.as.name} • Slot {view.as.slot}</div>
                </div>
              ) : <div>—</div>}
            </div>
            <div>
              <div className="text-muted-foreground">Marking Scheme</div>
              {view.ms ? (
                <div>
                  <div className="font-medium">{view.ms.courseCode}</div>
                  <div className="text-xs">{view.ms.examType ?? ""} • Slot {view.ms.slot ?? slot}</div>
                </div>
              ) : (
                <div className="text-xs">No Scheme Found: General Sscheme Applied</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
