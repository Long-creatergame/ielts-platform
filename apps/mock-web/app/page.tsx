"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "../lib/api";

export default function HomePage() {
  const [authed, setAuthed] = useState<boolean>(false);

  useEffect(() => {
    setAuthed(!!getToken());
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full border border-white/10 bg-white/5 rounded-2xl p-6">
          <div className="text-xs text-white/60">IELTS Mock Test</div>
          <h1 className="text-2xl font-semibold">Stress Mode</h1>
          <p className="mt-2 text-sm text-white/60">
            Full-screen. Timers. One submit. No hints. No sentence-level corrections.
          </p>
          <div className="mt-5">
            <Link
              className="inline-flex rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2 font-semibold"
              href="/login"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/60">IELTS Exam Simulator</div>
            <h1 className="text-2xl font-semibold">Mock Tests</h1>
            <p className="text-sm text-white/60">Pick one. Start. You only get one shot.</p>
          </div>
          <button
            className="text-xs border border-white/15 hover:border-white/30 rounded-lg px-3 py-2"
            onClick={() => {
              clearToken();
              location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/mock/writing"
            className="border border-white/10 bg-white/5 rounded-2xl p-5 hover:border-white/25"
          >
            <div className="text-xs text-white/60">Writing Task 2</div>
            <div className="text-lg font-semibold mt-1">40 minutes</div>
            <div className="text-sm text-white/60 mt-2">Full-screen essay. Submit once (auto-submit at 00:00).</div>
          </Link>

          <Link
            href="/mock/speaking"
            className="border border-white/10 bg-white/5 rounded-2xl p-5 hover:border-white/25"
          >
            <div className="text-xs text-white/60">Speaking Part 2</div>
            <div className="text-lg font-semibold mt-1">1 min prep + 2 min record</div>
            <div className="text-sm text-white/60 mt-2">Record once. No redo. ASR + scoring after submit.</div>
          </Link>
        </div>

        <div className="mt-6 text-xs text-white/40">
          Tip: close other tabs. This mode is designed to feel stressful.
        </div>
      </div>
    </div>
  );
}

