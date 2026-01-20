import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tests } from '../data/tests';
import { useAttemptStore } from '../store/attemptStore';

export default function Home() {
  const navigate = useNavigate();
  const test = tests.test1;
  const testId = 'test1';

  const storeTestId = useAttemptStore((s) => s.testId);
  const submittedAt = useAttemptStore((s) => s.submittedAt);
  const mode = useAttemptStore((s) => s.mode);
  const setMode = useAttemptStore((s) => s.actions.setMode);
  const start = useAttemptStore((s) => s.actions.startNewAttempt);
  const resume = useAttemptStore((s) => s.actions.resumeAttempt);
  const reset = useAttemptStore((s) => s.actions.resetAttempt);

  const hasResume = useMemo(() => storeTestId === testId && !submittedAt, [storeTestId, submittedAt, testId]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">IELTS Academic</div>
            <h1 className="text-2xl font-bold text-slate-900">{test.metadata.title}</h1>
            <p className="mt-2 text-sm text-slate-600">
              Default UX mode: <span className="font-semibold">Computer-delivered</span>. Autosave enabled.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-500">Time mode</div>
            <div className="flex gap-2">
              <button
                className={mode === 'computer' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setMode('computer')}
                type="button"
              >
                Computer-delivered
              </button>
              <button
                className={mode === 'paper' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setMode('paper')}
                type="button"
              >
                Paper-based
              </button>
            </div>
            <div className="text-xs text-slate-500">
              Listening: {test.metadata.timeLimits.listening.computerDeliveredMinutes}m +{' '}
              {test.metadata.timeLimits.listening.computerCheckMinutes}m check (computer) /{' '}
              {test.metadata.timeLimits.listening.paperBasedMinutes}m + {test.metadata.timeLimits.listening.paperBasedTransferMinutes}m transfer
              (paper)
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="card p-4">
            <div className="text-sm font-semibold text-slate-800">Start / Resume</div>
            <p className="mt-1 text-sm text-slate-600">
              Your attempt is saved to localStorage every 2 seconds and restored on refresh.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {!hasResume ? (
                <button
                  className="btn-primary"
                  onClick={() => {
                    start(testId, mode);
                    navigate(`/test/${testId}/listening?q=1`);
                  }}
                  type="button"
                >
                  Start Listening
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => {
                    resume();
                    navigate(`/test/${testId}/listening?q=1`);
                  }}
                  type="button"
                >
                  Resume attempt
                </button>
              )}
              <button className="btn-secondary" type="button" onClick={() => reset()}>
                Reset attempt
              </button>
            </div>
          </div>

          <div className="card p-4">
            <div className="text-sm font-semibold text-slate-800">Modules</div>
            <p className="mt-1 text-sm text-slate-600">
              You can jump to any module for training, but scoring is based on Listening + Reading.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link className="btn-secondary" to={`/test/${testId}/listening?q=1`}>
                Listening
              </Link>
              <Link className="btn-secondary" to={`/test/${testId}/reading?q=1`}>
                Reading
              </Link>
              <Link className="btn-secondary" to={`/test/${testId}/writing`}>
                Writing
              </Link>
              <Link className="btn-secondary" to={`/test/${testId}/speaking`}>
                Speaking
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Note: Listening transcript and Writing model answers/rubric are hidden during the test and revealed only after submit.
        </div>
      </div>
    </div>
  );
}

