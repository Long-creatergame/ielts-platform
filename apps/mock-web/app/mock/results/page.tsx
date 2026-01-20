"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { computeMockVsRealRisk, riskBadge } from "../../../lib/risk";

type WritingReport = {
  overall_band: number;
  criteria: { task: number; coherence: number; lexical: number; grammar: number };
  confidence: number;
  top_3_weaknesses: Array<{ area: string; pattern: string; impact: string }>;
};

type SpeakingReport = {
  overall_band: number;
  criteria: { fluency: number; lexical: number; grammar: number; pronunciation: number };
  confidence: number;
  top_3_weaknesses: Array<{ area: string; pattern: string; impact: string }>;
};

export default function ResultsPage() {
  const sp = useSearchParams();
  const module = sp.get("module") || "writing";
  const attemptId = sp.get("attemptId") || "";
  const [payload, setPayload] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("mock:lastResult");
      if (raw) setPayload(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const report = (payload?.report || null) as WritingReport | SpeakingReport | null;
  const wordCount = payload?.meta?.wordCount as number | undefined;
  const risk = useMemo(() => {
    const confidence = typeof report?.confidence === "number" ? report.confidence : undefined;
    return computeMockVsRealRisk({ confidence, wordCount, templateRisk: undefined });
  }, [report?.confidence, wordCount]);

  const badge = riskBadge(risk);

  if (!report) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto border border-white/10 bg-white/5 rounded-2xl p-6">
          <div className="text-xs text-white/60">RESULTS</div>
          <h1 className="text-2xl font-semibold mt-1">No result loaded</h1>
          <p className="text-sm text-white/60 mt-2">
            This page only shows the last submitted mock attempt (stored in sessionStorage).
          </p>
          <div className="mt-5 flex gap-3">
            <Link className="rounded bg-red-600 hover:bg-red-500 px-4 py-2 font-semibold" href="/">
              Back to Mock Tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const risks = (report.top_3_weaknesses || []).slice(0, 3);
  const likelyBand = report.overall_band;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-white/60">RESULTS • {String(module).toUpperCase()} • {attemptId.slice(-6)}</div>
            <h1 className="text-2xl font-semibold mt-1">Band Summary</h1>
            <div className="mt-2 text-sm text-white/60">
              If this were the real test, your most likely band would be{" "}
              <span className="text-white font-semibold">{likelyBand.toFixed(1)}</span>.
            </div>
          </div>
          <div className={`shrink-0 text-xs px-3 py-2 rounded-lg ${badge.className}`}>{badge.label}</div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-white/10 bg-white/5 rounded-2xl p-5">
            <div className="text-xs text-white/60">Overall band</div>
            <div className="mt-1 font-mono text-5xl">{likelyBand.toFixed(1)}</div>
            <div className="mt-2 text-xs text-white/45">Confidence: {(report.confidence * 100).toFixed(0)}%</div>
            {typeof wordCount === "number" && (
              <div className="mt-1 text-xs text-white/45">Word count: {wordCount}</div>
            )}
          </div>

          <div className="border border-white/10 bg-white/5 rounded-2xl p-5">
            <div className="text-xs text-white/60">Criteria</div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              {"task" in report.criteria && (
                <>
                  <div className="flex items-center justify-between border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-white/70">Task</span>
                    <span className="font-mono">{report.criteria.task.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-white/70">Coherence</span>
                    <span className="font-mono">{(report as WritingReport).criteria.coherence.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-white/70">Lexical</span>
                    <span className="font-mono">{(report as WritingReport).criteria.lexical.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-white/70">Grammar</span>
                    <span className="font-mono">{(report as WritingReport).criteria.grammar.toFixed(1)}</span>
                  </div>
                </>
              )}

              {"fluency" in report.criteria && (
                <>
                  <div className="flex items-center justify-between border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-white/70">Fluency</span>
                    <span className="font-mono">{(report as SpeakingReport).criteria.fluency.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-white/70">Lexical</span>
                    <span className="font-mono">{(report as SpeakingReport).criteria.lexical.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-white/70">Grammar</span>
                    <span className="font-mono">{(report as SpeakingReport).criteria.grammar.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-white/70">Pronunciation</span>
                    <span className="font-mono">{(report as SpeakingReport).criteria.pronunciation.toFixed(1)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 border border-white/10 bg-white/5 rounded-2xl p-5">
          <div className="text-xs text-white/60">3 biggest risks in the real exam</div>
          <div className="mt-3 space-y-3">
            {risks.map((r, idx) => (
              <div key={idx} className="border border-white/10 rounded-xl p-4">
                <div className="text-sm font-semibold">{idx + 1}. {r.area.toUpperCase()}</div>
                <div className="mt-1 text-sm text-white/70">{r.pattern}</div>
                <div className="mt-1 text-xs text-white/45">Impact: {r.impact}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-white/35">
            Note: no sentence-level corrections are shown in mock mode.
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link className="rounded bg-red-600 hover:bg-red-500 px-4 py-2 font-semibold" href="/">
            Back to Mock Tests
          </Link>
          <Link
            className="rounded border border-white/15 hover:border-white/30 px-4 py-2 font-semibold"
            href={module === "speaking" ? "/mock/speaking" : "/mock/writing"}
          >
            Retake (new attempt)
          </Link>
        </div>
      </div>
    </div>
  );
}

