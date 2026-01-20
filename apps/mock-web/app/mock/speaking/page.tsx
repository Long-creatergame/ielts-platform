"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const DEFAULT_CUE =
  "Describe a time you had to learn something quickly.\n\nYou should say:\n- what you had to learn\n- why you needed to learn it quickly\n- how you learned it\n\nand explain how you felt about the experience.";

type Phase = "idle" | "prep" | "recording" | "processing" | "done";

export default function MockSpeakingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [prepLeft, setPrepLeft] = useState(60);
  const [speakLeft, setSpeakLeft] = useState(120);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const oneTakeRef = useRef(false);

  const timeLabel = useMemo(() => {
    if (phase === "prep") return `Prep: ${formatMMSS(prepLeft)}`;
    if (phase === "recording") return `Speaking: ${formatMMSS(speakLeft)}`;
    return "";
  }, [phase, prepLeft, speakLeft]);

  useEffect(() => {
    if (phase !== "prep") return;
    if (prepLeft <= 0) return;
    const t = setInterval(() => setPrepLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase, prepLeft]);

  useEffect(() => {
    if (phase !== "prep") return;
    if (prepLeft !== 0) return;
    void beginRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepLeft, phase]);

  useEffect(() => {
    if (phase !== "recording") return;
    if (speakLeft <= 0) return;
    const t = setInterval(() => setSpeakLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase, speakLeft]);

  useEffect(() => {
    if (phase !== "recording") return;
    if (speakLeft !== 0) return;
    stopRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakLeft, phase]);

  async function start() {
    setError(null);
    setPhase("processing");
    try {
      const session = await apiFetch<any>("/api/v2/sessions", {
        method: "POST",
        body: JSON.stringify({
          mode: "mock",
          module: "speaking",
          timeLimitSeconds: 60 + 120,
          promptText: DEFAULT_CUE,
        }),
      });
      const sid = session?.data?.sessionId;
      if (!sid) throw new Error("Failed to create session");

      const attempt = await apiFetch<any>("/api/v2/speaking/attempts", {
        method: "POST",
        body: JSON.stringify({ sessionId: sid }),
      });
      const aid = attempt?.data?.attemptId;
      if (!aid) throw new Error("Failed to start attempt");
      setAttemptId(aid);

      setPhase("prep");
      setPrepLeft(60);
      setSpeakLeft(120);
    } catch (err: any) {
      setError(err?.message || "Failed to start");
      setPhase("idle");
    }
  }

  async function beginRecording() {
    if (oneTakeRef.current) return;
    if (!attemptId) return;
    setError(null);
    setPhase("processing");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        // stop tracks
        for (const track of stream.getTracks()) track.stop();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        await uploadAndScore(blob, recorder.mimeType || "audio/webm");
      };

      recorderRef.current = recorder;
      oneTakeRef.current = true; // lock: no redo
      setPhase("recording");
      recorder.start();
    } catch (err: any) {
      setError(err?.message || "Microphone permission denied");
      setPhase("prep");
    }
  }

  function stopRecording() {
    const rec = recorderRef.current;
    if (!rec) return;
    if (rec.state === "inactive") return;
    setPhase("processing");
    rec.stop();
  }

  async function uploadAndScore(blob: Blob, mimeType: string) {
    if (!attemptId) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Missing token");

      const fd = new FormData();
      fd.append("audio", blob, `speaking.${mimeType.includes("ogg") ? "ogg" : "webm"}`);

      const res = await fetch(`${baseUrl}/api/v2/speaking/attempts/${attemptId}/submit-audio`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Submit failed");

      sessionStorage.setItem(
        "mock:lastResult",
        JSON.stringify({
          module: "speaking",
          attemptId,
          report: json?.data,
          meta: { mimeType },
        })
      );

      setPhase("done");
      router.push(`/mock/results?module=speaking&attemptId=${attemptId}`);
    } catch (err: any) {
      setError(err?.message || "Upload/scoring failed");
      setPhase("done");
    }
  }

  return (
    <div className="fixed inset-0 bg-black">
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="text-xs text-white/60">SPEAKING PART 2 • MOCK</div>
          {timeLabel && (
            <div className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10">
              {timeLabel}
            </div>
          )}
          {oneTakeRef.current && (
            <div className="text-xs text-white/50">One take locked.</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {phase === "idle" && (
            <button onClick={start} className="rounded bg-red-600 hover:bg-red-500 px-3 py-2 text-sm font-semibold">
              Start Mock
            </button>
          )}
          {phase === "recording" && (
            <button onClick={stopRecording} className="rounded bg-red-600 hover:bg-red-500 px-3 py-2 text-sm font-semibold">
              Stop (submit)
            </button>
          )}
          <button
            onClick={() => {
              if ((phase === "prep" || phase === "recording") && !confirm("Exit? Your attempt will be wasted.")) return;
              router.push("/");
            }}
            className="rounded border border-white/15 hover:border-white/30 px-3 py-2 text-sm"
          >
            Exit
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-3.5rem)] grid grid-cols-1 lg:grid-cols-2">
        <div className="border-r border-white/10 p-4 overflow-auto">
          <div className="text-xs text-white/60 mb-2">CUE CARD</div>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{DEFAULT_CUE}</pre>
          <div className="mt-6 text-xs text-white/35">
            Rules: 1 minute prep (no notes shown here), then 2 minutes speaking. Record once.
          </div>
          {error && (
            <div className="mt-4 text-sm border border-red-500/30 bg-red-500/10 text-red-200 rounded-lg p-3">
              {error}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="text-xs text-white/60 mb-2">STATUS</div>
          <div className="border border-white/10 bg-white/5 rounded-2xl p-5">
            {phase === "idle" && <div className="text-sm text-white/60">Press Start Mock. You will be recorded once.</div>}
            {phase === "prep" && (
              <div>
                <div className="text-lg font-semibold">Preparation</div>
                <div className="text-sm text-white/60 mt-1">Think. Structure. Don’t write here.</div>
                <div className="mt-4 font-mono text-4xl">{formatMMSS(prepLeft)}</div>
              </div>
            )}
            {phase === "recording" && (
              <div>
                <div className="text-lg font-semibold">Recording</div>
                <div className="text-sm text-white/60 mt-1">Speak continuously. No redo.</div>
                <div className="mt-4 font-mono text-4xl">{formatMMSS(speakLeft)}</div>
              </div>
            )}
            {phase === "processing" && (
              <div>
                <div className="text-lg font-semibold">Processing</div>
                <div className="text-sm text-white/60 mt-1">Uploading + transcribing + scoring…</div>
                <div className="mt-4 text-xs text-white/40">Do not refresh.</div>
              </div>
            )}
            {phase === "done" && (
              <div className="text-sm text-white/60">
                Finished. If results didn’t load, go back and retry (you may need a new attempt).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

