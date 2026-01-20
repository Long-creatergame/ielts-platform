import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttemptStore } from '../store/attemptStore';
import type { Module } from '../store/attemptStore';

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TimerBar({ module, title, reviewHref }: { module: Module; title: string; reviewHref: string }) {
  const navigate = useNavigate();
  const timeLeft = useAttemptStore((s) => s.moduleTimeLeftSec[module] ?? 0);
  const startedAt = useAttemptStore((s) => s.moduleStartedAt[module] ?? null);
  const tick = useAttemptStore((s) => s.actions.tick);

  useEffect(() => {
    if (!startedAt) return;
    const id = window.setInterval(() => tick(module), 1000);
    return () => window.clearInterval(id);
  }, [module, startedAt, tick]);

  useEffect(() => {
    if (startedAt && timeLeft === 0) {
      navigate(reviewHref);
    }
  }, [navigate, reviewHref, startedAt, timeLeft]);

  const danger = useMemo(() => timeLeft <= 5 * 60, [timeLeft]);

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="pill bg-slate-100 text-slate-700">{title}</span>
          <span className="text-sm text-slate-600">Computer-delivered style</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`pill ${danger ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
            Time left: {fmt(timeLeft)}
          </div>
          <button className="btn-secondary" onClick={() => navigate(reviewHref)}>
            Review
          </button>
        </div>
      </div>
    </div>
  );
}

