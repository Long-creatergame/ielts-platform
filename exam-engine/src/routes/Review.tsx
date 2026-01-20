import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { tests } from '../data/tests';
import { useAttemptStore } from '../store/attemptStore';
import type { Module } from '../store/attemptStore';

function isAnswered(v: any): boolean {
  if (!v) return false;
  const value = String(v.value ?? '').trim();
  return value.length > 0;
}

export default function Review() {
  const { testId = 'test1', module = 'listening' } = useParams();
  const mod = module as Module;
  const test = tests[testId as keyof typeof tests];
  const navigate = useNavigate();

  const answers = useAttemptStore((s) => s.answers);
  const flagged = useAttemptStore((s) => s.flagged);
  const submitModule = useAttemptStore((s) => s.actions.submitModule);

  const rows = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const id = i + 1;
      const a = answers[id];
      return {
        id,
        answered: isAnswered(a),
        flagged: !!flagged[id],
        value: a?.value ?? '',
      };
    });
  }, [answers, flagged]);

  const counts = useMemo(() => {
    const answered = rows.filter((r) => r.answered).length;
    const flaggedCount = rows.filter((r) => r.flagged).length;
    return { answered, unanswered: 40 - answered, flagged: flaggedCount };
  }, [rows]);

  const nextModuleHref =
    mod === 'listening'
      ? `/test/${testId}/reading?q=1`
      : mod === 'reading'
        ? `/test/${testId}/writing`
        : mod === 'writing'
          ? `/test/${testId}/speaking`
          : `/results/${testId}`;

  const canScore = mod === 'listening' || mod === 'reading';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-500">{test.metadata.title}</div>
          <h1 className="text-2xl font-bold text-slate-900">Review – {mod}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="pill bg-emerald-100 text-emerald-800">Answered: {counts.answered}</span>
            <span className="pill bg-slate-100 text-slate-700">Unanswered: {counts.unanswered}</span>
            <span className="pill bg-amber-100 text-amber-900">Flagged: {counts.flagged}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link className="btn-secondary" to={`/test/${testId}/${mod}?q=1`}>
            Back to test
          </Link>
          {canScore ? (
            <button
              className="btn-primary"
              type="button"
              onClick={() => {
                submitModule(mod);
                navigate(nextModuleHref);
              }}
            >
              Submit {mod}
            </button>
          ) : (
            <button className="btn-primary" type="button" onClick={() => navigate(nextModuleHref)}>
              Continue
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
          <div className="col-span-2">Question</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Flag</div>
          <div className="col-span-6">Your answer</div>
        </div>
        <div className="divide-y divide-slate-100">
          {rows.map((r) => (
            <Link
              key={r.id}
              className="grid grid-cols-12 gap-2 px-3 py-2 text-sm hover:bg-slate-50"
              to={`/test/${testId}/${mod}?q=${r.id}`}
            >
              <div className="col-span-2 font-semibold text-slate-900">{r.id}</div>
              <div className="col-span-2">
                {r.answered ? (
                  <span className="pill bg-emerald-100 text-emerald-800">Answered</span>
                ) : (
                  <span className="pill bg-slate-100 text-slate-700">Unanswered</span>
                )}
              </div>
              <div className="col-span-2">{r.flagged ? <span className="pill bg-amber-100 text-amber-900">Flagged</span> : '—'}</div>
              <div className="col-span-6 truncate text-slate-700">{r.value || '—'}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500">
        Listening transcript and model answers remain hidden until final submission.
      </div>
    </div>
  );
}

