import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { tests } from '../data/tests';
import { useAttemptStore } from '../store/attemptStore';
import { scoreModule } from '../utils/scoring';

export default function Results() {
  const { testId = 'test1' } = useParams();
  const test = tests[testId as keyof typeof tests];

  const submittedAt = useAttemptStore((s) => s.submittedAt);
  const submitAll = useAttemptStore((s) => s.actions.submitAll);
  const answers = useAttemptStore((s) => s.answers);
  const reset = useAttemptStore((s) => s.actions.resetAttempt);

  const answersById = useMemo(() => {
    const out: Record<number, string | undefined> = {};
    for (let i = 1; i <= 40; i++) {
      out[i] = answers[i]?.value?.toString();
    }
    return out;
  }, [answers]);

  const listening = useMemo(() => scoreModule('listening', answersById, test), [answersById, test]);
  const reading = useMemo(() => scoreModule('reading', answersById, test), [answersById, test]);

  const showProtected = !!submittedAt;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-500">{test.metadata.title}</div>
          <h1 className="text-2xl font-bold text-slate-900">Results</h1>
          <p className="mt-2 text-sm text-slate-600">
            {showProtected
              ? 'This attempt has been submitted. Transcript/model answers are now visible.'
              : 'Not submitted yet. Submit to unlock transcript, model answers and full review.'}
          </p>
        </div>
        <div className="flex gap-2">
          {!showProtected ? (
            <button className="btn-primary" onClick={() => submitAll()} type="button">
              Submit full test
            </button>
          ) : null}
          <button className="btn-secondary" type="button" onClick={() => reset()}>
            Reset attempt
          </button>
          <Link className="btn-secondary" to="/">
            Home
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <div className="text-sm font-semibold">Listening</div>
          <div className="mt-2 text-3xl font-bold">{listening.raw}/40</div>
          <div className="mt-1 text-sm text-slate-600">Estimated band: {listening.band.toFixed(1)}</div>
        </div>
        <div className="card p-6">
          <div className="text-sm font-semibold">Reading</div>
          <div className="mt-2 text-3xl font-bold">{reading.raw}/40</div>
          <div className="mt-1 text-sm text-slate-600">Estimated band: {reading.band.toFixed(1)}</div>
        </div>
      </div>

      <div className="mt-6 card overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold">
          Answer review (Listening + Reading)
        </div>
        <div className="divide-y divide-slate-100">
          {[...listening.details].map((d) => (
            <div key={`l-${d.id}`} className="grid grid-cols-12 gap-2 px-4 py-2 text-sm">
              <div className="col-span-2 font-semibold">L {d.id}</div>
              <div className="col-span-3">
                {d.ok ? (
                  <span className="pill bg-emerald-100 text-emerald-800">Correct</span>
                ) : (
                  <span className="pill bg-red-100 text-red-800">Incorrect</span>
                )}
              </div>
              <div className="col-span-3 text-slate-700">Your: {d.user || '—'}</div>
              <div className="col-span-4 text-slate-700">Correct: {d.correct}</div>
            </div>
          ))}
          {[...reading.details].map((d) => (
            <div key={`r-${d.id}`} className="grid grid-cols-12 gap-2 px-4 py-2 text-sm">
              <div className="col-span-2 font-semibold">R {d.id}</div>
              <div className="col-span-3">
                {d.ok ? (
                  <span className="pill bg-emerald-100 text-emerald-800">Correct</span>
                ) : (
                  <span className="pill bg-red-100 text-red-800">Incorrect</span>
                )}
              </div>
              <div className="col-span-3 text-slate-700">Your: {d.user || '—'}</div>
              <div className="col-span-4 text-slate-700">Correct: {d.correct}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <div className="text-sm font-semibold">Listening transcript</div>
          {!showProtected ? (
            <div className="mt-2 text-sm text-slate-600">Hidden until submit.</div>
          ) : (
            <div className="mt-3 space-y-3">
              {test.listening.sections.map((s, idx) => (
                <div key={s.title} className="card p-3 bg-slate-50">
                  <div className="text-xs font-semibold text-slate-700">Section {idx + 1}: {s.title}</div>
                  <div className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{s.transcript}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="text-sm font-semibold">Writing model answers & rubric</div>
          {!showProtected ? (
            <div className="mt-2 text-sm text-slate-600">Hidden until submit.</div>
          ) : (
            <div className="mt-3 space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-700">Task 1 – Band 7+ model</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{test.writing.task1.modelAnswerBand7}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-700">Task 2 – Band 7+ model</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{test.writing.task2.modelAnswerBand7}</div>
              </div>
              <div className="card p-3 bg-slate-50">
                <div className="text-xs font-semibold text-slate-700">Rubric (summary)</div>
                <ul className="mt-2 list-disc pl-5 text-xs text-slate-700">
                  <li>{test.writing.bandRubricSummary.taskAchievement}</li>
                  <li>{test.writing.bandRubricSummary.coherenceCohesion}</li>
                  <li>{test.writing.bandRubricSummary.lexicalResource}</li>
                  <li>{test.writing.bandRubricSummary.grammar}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 card p-6">
        <div className="text-sm font-semibold">Examiner notes</div>
        <div className="mt-3">
          <div className="text-xs font-semibold text-slate-700">Common mistakes</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
            {test.examinerNotes.commonMistakes.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-700">Band differentiation</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
            {test.examinerNotes.differentiation.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

