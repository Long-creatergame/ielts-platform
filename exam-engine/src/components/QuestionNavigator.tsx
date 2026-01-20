import { useMemo } from 'react';
import { useAttemptStore } from '../store/attemptStore';

function isAnswered(v: unknown): boolean {
  if (!v) return false;
  if (typeof v === 'object' && v !== null && 'value' in (v as any)) {
    const value = String((v as any).value ?? '').trim();
    return value.length > 0;
  }
  return false;
}

export default function QuestionNavigator({
  total = 40,
  current,
  onJump,
}: {
  total?: number;
  current: number;
  onJump: (id: number) => void;
}) {
  const answers = useAttemptStore((s) => s.answers);
  const flagged = useAttemptStore((s) => s.flagged);

  const items = useMemo(() => Array.from({ length: total }, (_, i) => i + 1), [total]);

  return (
    <div className="card p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-800">Questions</div>
        <div className="flex gap-2 text-xs text-slate-600">
          <span className="pill bg-slate-100">unanswered</span>
          <span className="pill bg-emerald-100 text-emerald-700">answered</span>
          <span className="pill bg-amber-100 text-amber-800">flagged</span>
        </div>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {items.map((id) => {
          const ans = answers[id];
          const isA = isAnswered(ans);
          const isF = !!flagged[id];
          const isC = id === current;
          const base = 'h-8 rounded-md text-xs font-semibold';
          const cls = isC
            ? 'bg-blue-600 text-white'
            : isF
              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              : isA
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200';
          return (
            <button key={id} className={`${base} ${cls}`} onClick={() => onJump(id)} type="button">
              {id}
            </button>
          );
        })}
      </div>
    </div>
  );
}

