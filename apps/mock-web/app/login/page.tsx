"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, setToken } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<any>("/api/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      const token = res?.token || res?.data?.token;
      if (!token) throw new Error("Missing token from server");
      setToken(token);
      router.replace("/");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-white/10 bg-white/5 rounded-2xl p-6">
        <div className="mb-4">
          <div className="text-xs text-white/60">Exam Simulator</div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-white/60">No practice mode. Mock mode only.</p>
        </div>

        {error && (
          <div className="mb-4 text-sm border border-red-500/30 bg-red-500/10 text-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-white/60">Email</label>
            <input
              className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="text-xs text-white/60">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 px-3 py-2 font-semibold"
          >
            {loading ? "Signing in…" : "Enter exam mode"}
          </button>
        </form>

        <div className="mt-4 text-xs text-white/50">
          Backend: <span className="font-mono">{process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000"}</span>
        </div>
      </div>
    </div>
  );
}

