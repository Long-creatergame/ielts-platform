"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const DEFAULT_PROMPT =
  "Some people believe that governments should spend more money on public transport rather than building new roads. To what extent do you agree or disagree?";

export default function MockWritingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "running" | "submitting" | "done">("idle");
  const [secondsLeft, setSecondsLeft] = useState<number>(40 * 60);
  const [essay, setEssay] = useState<string>("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const wordCount = useMemo(() => {
    const w = essay.trim().split(/\s+/).filter(Boolean);
    return essay.trim().length ? w.length : 0;
  }, [essay]);

  useEffect(() => {
    if (phase !== "running") return;
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (phase !== "running") return;
    if (secondsLeft !== 0) return;
    // Auto-submit at 00:00 (one shot)
    void submitOnce("timeout");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase]);

  async function start() {
    setError(null);
    setPhase("submitting");
    try {
      const session = await apiFetch<any>("/api/v2/sessions", {
        method: "POST",
        body: JSON.stringify({
          mode: "mock",
          module: "writing",
          timeLimitSeconds: 40 * 60,
          promptText: DEFAULT_PROMPT,
        }),
      });
      const sid = session?.data?.sessionId;
      if (!sid) throw new Error("Failed to create session");
      setSessionId(sid);

      const attempt = await apiFetch<any>("/api/v2/writing/attempts", {
        method: "POST",
        body: JSON.stringify({ sessionId: sid }),
      });
      const aid = attempt?.data?.attemptId;
      if (!aid) throw new Error("Failed to start attempt");
      setAttemptId(aid);
      setPhase("running");
    } catch (err: any) {
      setError(err?.message || "Failed to start");
      setPhase("idle");
    }
  }

  async function submitOnce(reason: "manual" | "timeout") {
    if (submittedRef.current) return;
    if (!attemptId) return;
    submittedRef.current = true;
    setPhase("submitting");
    try {
      const res = await apiFetch<any>(`/api/v2/writing/attempts/${attemptId}/submit`, {
        method: "POST",
        body: JSON.stringify({
          essay,
          clientMeta: { wordCount, userAgent: navigator.userAgent },
        }),
      });
      const report = res?.data;
      // Store minimal payload for results page
      sessionStorage.setItem(
        "mock:lastResult",
        JSON.stringify({
          module: "writing",
          attemptId,
          report,
          meta: { reason, wordCount },
        })
      );
      setPhase("done");
      router.push(`/mock/results?module=writing&attemptId=${attemptId}`);
    } catch (err: any) {
      setError(err?.message || "Submit failed");
      setPhase("running");
      submittedRef.current = false;
    }
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Top bar */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="text-xs text-white/60">WRITING TASK 2 • MOCK</div>
          <div className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10">
            Time left: <span className="font-mono">{formatMMSS(secondsLeft)}</span>
          </div>
          <div className="text-xs text-white/50">Words: {wordCount}</div>
        </div>
        <div className="flex items-center gap-2">
          {phase === "idle" && (
            <button onClick={start} className="rounded bg-red-600 hover:bg-red-500 px-3 py-2 text-sm font-semibold">
              Start Mock
            </button>
          )}
          {phase === "running" && (
            <button
              onClick={() => {
                if (confirm("Submit now? You cannot edit after submitting.")) void submitOnce("manual");
              }}
              className="rounded bg-red-600 hover:bg-red-500 px-3 py-2 text-sm font-semibold"
            >
              Submit (one shot)
            </button>
          )}
          <button
            onClick={() => {
              if (phase === "running" && !confirm("Exit? Your attempt will be wasted.")) return;
              router.push("/");
            }}
            className="rounded border border-white/15 hover:border-white/30 px-3 py-2 text-sm"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="h-[calc(100vh-3.5rem)] grid grid-cols-1 lg:grid-cols-2">
        <div className="border-r border-white/10 p-4 overflow-auto">
          <div className="text-xs text-white/60 mb-2">TASK</div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{DEFAULT_PROMPT}</div>
          <div className="mt-6 text-xs text-white/35">
            Rules: no hints, no AI help. Write like it is the real test.
          </div>
          {error && (
            <div className="mt-4 text-sm border border-red-500/30 bg-red-500/10 text-red-200 rounded-lg p-3">
              {error}
            </div>
          )}
          {phase === "submitting" && (
            <div className="mt-4 text-sm border border-white/10 bg-white/5 rounded-lg p-3">
              Submitting… do not refresh.
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="text-xs text-white/60 mb-2">ANSWER SHEET</div>
          <textarea
            className="w-full h-[calc(100vh-8.5rem)] resize-none rounded-xl bg-white/5 border border-white/10 p-4 outline-none focus:border-white/25 font-sans text-sm leading-relaxed"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            disabled={phase !== "running"}
            placeholder={phase === "idle" ? "Press Start Mock to begin." : "Write here…"}
          />
          <div className="mt-2 text-xs text-white/40">
            Tip: keep going even if it’s messy. That’s the point.
          </div>
        </div>
      </div>
    </div>
  );
}

