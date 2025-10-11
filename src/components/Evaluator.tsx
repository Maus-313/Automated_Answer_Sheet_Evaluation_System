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
  // Optional per-answer marks if present in payload
  answer1?: number; answer2?: number; answer3?: number; answer4?: number; answer5?: number;
  answer6?: number; answer7?: number; answer8?: number; answer9?: number; answer10?: number;
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
  const [selectedAnsRollNos, setSelectedAnsRollNos] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [availableMs, setAvailableMs] = useState<MSItem[]>([]);
  const [msLoading, setMsLoading] = useState(false);
  const [selectedMsIdx, setSelectedMsIdx] = useState<string>("");
  const ms = selectedMsIdx !== "" ? availableMs[Number(selectedMsIdx)] || null : null;

  const [view, setView] = useState<{
    qp?: QPItem;
    ms?: MSItem | null;
    eval?: { evaluated: number; total: number };
  } | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  // Load QPs and AS for slot
  useEffect(() => {
    if (!slot) {
      setQps(null); setAnswers(null);
      setSelectedQpIdx(""); setSelectedAnsRollNos([]); setSelectAll(false);
      setAvailableMs([]); setSelectedMsIdx("");
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
          setSelectedQpIdx(""); setSelectedAnsRollNos([]); setSelectAll(false);
          setSelectedMsIdx("");
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

  // Load all MS for slot
  useEffect(() => {
    if (!slot) {
      setAvailableMs([]);
      setSelectedMsIdx("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setMsLoading(true);
        const qs = `?slot=${encodeURIComponent(slot)}`;
        const res = await fetch(`/marking-scheme${qs}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load marking schemes");
        if (!cancelled) {
          setAvailableMs(Array.isArray(data?.items) ? data.items : []);
          setSelectedMsIdx("");
        }
      } catch {
        if (!cancelled) setAvailableMs([]);
      } finally {
        if (!cancelled) setMsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slot]);

  const canEvaluate = !!slot && selectedQpIdx !== "" && selectedAnsRollNos.length > 0;
  const selectedQp = selectedQpIdx !== "" ? qps?.[Number(selectedQpIdx)] : undefined;
  const selectedAnswers = answers?.filter(a => selectedAnsRollNos.includes(a.rollNo)) || [];

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
          <div className="text-sm font-medium mb-2">Answer Sheets</div>
          {!slot ? (
            <div className="text-sm text-muted-foreground">Please Select A Slot</div>
          ) : ansLoading ? (
            <div className="text-sm"><LoadingDots /></div>
          ) : ansError ? (
            <div className="text-sm text-red-600 dark:text-red-400">{ansError}</div>
          ) : !answers || answers.length === 0 ? (
            <div className="text-sm">No Record Found</div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => {
                    setSelectAll(e.target.checked);
                    setSelectedAnsRollNos(e.target.checked ? answers.map(a => a.rollNo) : []);
                  }}
                />
                Select All
              </label>
              {answers.map((a) => (
                <label key={a.rollNo} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedAnsRollNos.includes(a.rollNo)}
                    onChange={(e) => {
                      const rollNo = a.rollNo;
                      let newSelected;
                      if (e.target.checked) {
                        newSelected = [...selectedAnsRollNos, rollNo];
                        setSelectedAnsRollNos(newSelected);
                        if (newSelected.length === answers.length) setSelectAll(true);
                      } else {
                        newSelected = selectedAnsRollNos.filter(r => r !== rollNo);
                        setSelectedAnsRollNos(newSelected);
                        setSelectAll(false);
                      }
                    }}
                  />
                  {a.rollNo} • {a.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-md border border-black/10 dark:border-white/20 p-3">
          <div className="text-sm font-medium mb-2">Marking Scheme</div>
          {!slot ? (
            <div className="text-sm text-muted-foreground">Please Select A Slot</div>
          ) : msLoading ? (
            <div className="text-sm"><LoadingDots /></div>
          ) : availableMs.length === 0 ? (
            <div className="text-sm">No Marking Schemes Found: General Scheme Applied</div>
          ) : (
            <select
              className="w-full text-sm rounded-md border border-black/10 dark:border-white/20 px-2 py-1 bg-white text-black dark:bg-neutral-900 dark:text-white"
              value={selectedMsIdx}
              onChange={(e) => setSelectedMsIdx(e.target.value)}
            >
              <option value="">None (General Scheme)</option>
              {availableMs.map((scheme, idx) => (
                <option key={`${scheme.courseCode}-${scheme.examType}-${idx}`} value={String(idx)}>
                  {scheme.courseCode}{scheme.examType ? ` • ${scheme.examType}` : ""} • {scheme.items.length} questions
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canEvaluate || evaluating}
          onClick={async () => {
            if (!selectedQp || selectedAnswers.length === 0) return;
            setEvaluating(true);
            try {
              const res = await fetch('/ai/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qp: selectedQp, answers: selectedAnswers, ms })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Evaluation failed');
              const { results } = data;
              setView({ qp: selectedQp, ms, eval: { evaluated: results.length, total: selectedAnswers.length } });
            } catch (error: any) {
              console.error(error);
              // For now, just log; maybe show error in UI later
            } finally {
              setEvaluating(false);
            }
          }}
          className={[
            "relative inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            evaluating ? "cursor-wait" : "",
            // Modern gradient + glow
            "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white",
            "shadow-md shadow-indigo-500/30",
            "transition-all duration-300",
            !evaluating ? "hover:shadow-lg hover:shadow-indigo-500/40 hover:scale-[1.02]" : "",
          ].join(' ')}
        >
          <span className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" style={{
            background: 'radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(255,255,255,0.15), transparent 40%)'
          }} />
          <Sparkles className={`h-4 w-4 ${evaluating ? 'animate-pulse' : ''}`} />
          {evaluating ? 'Evaluating…' : 'Evaluate'}
        </button>
      </div>

      {view ? (
        <div className="rounded-md border border-black/10 dark:border-white/20 p-3 text-sm">
          <div className="font-medium mb-2">Evaluation Summary</div>
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
              <div className="text-muted-foreground">Marking Scheme</div>
              {view.ms ? (
                <div>
                  <div className="font-medium">{view.ms.courseCode}</div>
                  <div className="text-xs">{view.ms.examType ?? ""} • Slot {view.ms.slot ?? slot}</div>
                </div>
              ) : (
                <div className="text-xs">No Scheme Found: General Scheme Applied</div>
              )}
            </div>
            <div>
              <div className="text-muted-foreground">Evaluation Status</div>
              {view.eval ? (
                <div>
                  <div className="font-medium">{view.eval.evaluated}/{view.eval.total} Evaluated</div>
                  <div className="mt-1 h-2 w-full rounded bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-lime-500"
                      style={{ width: `${Math.min(100, Math.round((view.eval.evaluated / view.eval.total) * 100))}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs">—</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
