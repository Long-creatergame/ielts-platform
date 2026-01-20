import { useMemo } from 'react';
import type { IELTSQuestion } from '../utils/schema';
import { useAttemptStore } from '../store/attemptStore';
import type { AnswerValue } from '../store/attemptStore';

function getValue(v: AnswerValue | undefined): string {
  if (!v) return '';
  return v.value ?? '';
}

export default function QuestionRenderer({ q }: { q: IELTSQuestion }) {
  const setAnswer = useAttemptStore((s) => s.actions.setAnswer);
  const current = useAttemptStore((s) => s.answers[q.id]);
  const value = useMemo(() => getValue(current), [current]);

  const label = `Q${q.id}`;

  const common = (
    <>
      <div className="mb-2 text-sm font-semibold text-slate-900">{label}</div>
      <div className="text-slate-800 whitespace-pre-wrap">{q.prompt}</div>
      {q.constraints ? <div className="mt-2 text-xs text-slate-500">({q.constraints})</div> : null}
    </>
  );

  if (q.type === 'listening_multiple_choice' || q.type === 'reading_multiple_choice') {
    return (
      <div className="card p-4">
        {common}
        <div className="mt-4 space-y-2">
          {q.options.map((o) => (
            <label key={o.key} className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={value === o.key}
                onChange={() => setAnswer(q.id, { kind: 'choice', value: o.key })}
              />
              <div>
                <div className="text-sm font-semibold text-slate-800">{o.key}</div>
                <div className="text-sm text-slate-700">{o.text}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (q.type === 'listening_map_label' || q.type === 'listening_matching' || q.type === 'reading_matching_headings' || q.type === 'reading_matching_information') {
    return (
      <div className="card p-4">
        {common}
        <div className="mt-4">
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={value}
            onChange={(e) => setAnswer(q.id, { kind: 'dropdown', value: e.target.value })}
          >
            <option value="">Select…</option>
            {q.options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.key} — {o.text}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (q.type === 'reading_t_f_ng') {
    const options = [
      { key: 'TRUE', text: 'TRUE' },
      { key: 'FALSE', text: 'FALSE' },
      { key: 'NOT GIVEN', text: 'NOT GIVEN' },
    ];
    return (
      <div className="card p-4">
        {common}
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              className={`btn ${value === o.key ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'}`}
              onClick={() => setAnswer(q.id, { kind: 'choice', value: o.key })}
            >
              {o.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Text-entry types
  return (
    <div className="card p-4">
      {common}
      <div className="mt-4">
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Type your answer…"
          value={value}
          onChange={(e) => setAnswer(q.id, { kind: 'text', value: e.target.value })}
        />
      </div>
    </div>
  );
}

