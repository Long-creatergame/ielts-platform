import { useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TimerBar from '../components/TimerBar';
import QuestionNavigator from '../components/QuestionNavigator';
import BottomControls from '../components/BottomControls';
import QuestionRenderer from '../components/QuestionRenderer';
import { tests } from '../data/tests';
import { useAttemptStore } from '../store/attemptStore';
import type { Module } from '../store/attemptStore';

function totalSecondsForModule(module: Module, mode: 'computer' | 'paper', testId: string) {
  const test = tests[testId as keyof typeof tests];
  if (!test) return 0;
  if (module === 'listening') {
    const base = mode === 'computer' ? test.metadata.timeLimits.listening.computerDeliveredMinutes : test.metadata.timeLimits.listening.paperBasedMinutes;
    const extra = mode === 'computer' ? test.metadata.timeLimits.listening.computerCheckMinutes : test.metadata.timeLimits.listening.paperBasedTransferMinutes;
    return (base + extra) * 60;
  }
  if (module === 'reading') return test.metadata.timeLimits.readingMinutes * 60;
  if (module === 'writing') return test.metadata.timeLimits.writingMinutes * 60;
  return 14 * 60;
}

export default function TestShell() {
  const { testId = 'test1', module = 'listening' } = useParams();
  const mod = module as Module;
  const test = tests[testId as keyof typeof tests];
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const storeTestId = useAttemptStore((s) => s.testId);
  const mode = useAttemptStore((s) => s.mode);
  const enter = useAttemptStore((s) => s.actions.enterModule);
  const touchAutosave = useAttemptStore((s) => s.actions.touchAutosave);
  const setCurrent = useAttemptStore((s) => s.actions.setCurrentQuestion);
  const currentId = useAttemptStore((s) => s.currentQuestionId);
  const answers = useAttemptStore((s) => s.answers);

  // Ensure attempt exists for this test
  useEffect(() => {
    if (!test) return;
    if (!storeTestId || storeTestId !== testId) {
      navigate('/', { replace: true });
    }
  }, [navigate, storeTestId, test, testId]);

  // Enter module once (initialise timer)
  useEffect(() => {
    if (!test) return;
    const existing = useAttemptStore.getState().moduleStartedAt[mod];
    if (!existing) {
      enter(mod, totalSecondsForModule(mod, mode, testId));
    }
  }, [enter, mod, mode, test, testId]);

  // Autosave heartbeat every 2 seconds
  useEffect(() => {
    const id = window.setInterval(() => touchAutosave(), 2000);
    return () => window.clearInterval(id);
  }, [touchAutosave]);

  // Sync current question from URL
  useEffect(() => {
    const q = Number(sp.get('q') || '1');
    if (Number.isFinite(q) && q >= 1 && q <= 40) setCurrent(q);
  }, [setCurrent, sp]);

  const reviewHref = `/review/${testId}/${mod}`;

  const onJump = (id: number) => {
    setSp((prev) => {
      prev.set('q', String(id));
      return prev;
    });
    setCurrent(id);
  };

  const onPrev = () => onJump(Math.max(1, currentId - 1));
  const onNext = () => onJump(Math.min(40, currentId + 1));

  const readingData = test?.reading;
  const listeningData = test?.listening;

  const question = useMemo(() => {
    if (!test) return null;
    if (mod === 'reading') {
      const all = readingData.passages.flatMap((p) => p.questions);
      return all.find((x) => x.id === currentId) ?? null;
    }
    if (mod === 'listening') {
      const all = listeningData.sections.flatMap((s) => s.questions);
      return all.find((x) => x.id === currentId) ?? null;
    }
    return null;
  }, [currentId, listeningData, mod, readingData, test]);

  const readingPassageForQ = useMemo(() => {
    if (!test || mod !== 'reading') return null;
    return readingData.passages.find((p) => p.questions.some((qq) => qq.id === currentId)) ?? readingData.passages[0];
  }, [currentId, mod, readingData, test]);

  const title = mod === 'listening' ? 'Listening' : mod === 'reading' ? 'Reading' : mod === 'writing' ? 'Writing' : 'Speaking';

  if (!test) return null;

  if (mod === 'writing') {
    return (
      <>
        <TimerBar module={mod} title="Writing" reviewHref={`/review/${testId}/writing`} />
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
          <WritingUI testId={testId} />
        </div>
      </>
    );
  }

  if (mod === 'speaking') {
    return (
      <>
        <TimerBar module={mod} title="Speaking" reviewHref={`/review/${testId}/speaking`} />
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
          <SpeakingUI testId={testId} />
        </div>
      </>
    );
  }

  return (
    <>
      <TimerBar module={mod} title={title} reviewHref={reviewHref} />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 pb-24 pt-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <QuestionNavigator current={currentId} onJump={onJump} />
          <div className="mt-3 card p-3 text-xs text-slate-600">
            <div className="font-semibold text-slate-800">Autosave</div>
            <div className="mt-1">Saved locally every 2 seconds. Refresh to resume.</div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {mod === 'reading' ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card p-4 max-h-[70vh] overflow-auto">
                <div className="text-sm font-semibold text-slate-900">{readingPassageForQ?.title}</div>
                <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                  {readingPassageForQ?.text}
                </div>
              </div>
              <div>
                {question ? <QuestionRenderer q={question} /> : null}
                <div className="mt-3 text-xs text-slate-500">
                  Current answer: <span className="font-semibold">{answers[currentId]?.value ?? '—'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {question ? <QuestionRenderer q={question} /> : null}
              <div className="mt-3 text-xs text-slate-500">
                Current answer: <span className="font-semibold">{answers[currentId]?.value ?? '—'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomControls currentId={currentId} onPrev={onPrev} onNext={onNext} total={40} />
    </>
  );
}

function WritingUI({ testId }: { testId: string }) {
  const test = tests[testId as keyof typeof tests];
  const draft1 = useAttemptStore((s) => s.writingDrafts.task1);
  const draft2 = useAttemptStore((s) => s.writingDrafts.task2);
  const wc = useAttemptStore((s) => s.writingDrafts.lastWordCount);
  const setDraft = useAttemptStore((s) => s.actions.setWritingDraft);

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Task 1</div>
          <div className="pill bg-slate-100 text-slate-700">Word count: {wc.task1}</div>
        </div>
        <div className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{test.writing.task1.prompt}</div>
        <div className="mt-3 card p-3 bg-slate-50 border-slate-200">
          <div className="text-xs font-semibold text-slate-700">Dataset (text)</div>
          <div className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{test.writing.task1.datasetText}</div>
        </div>
        <textarea
          className="mt-4 w-full min-h-[220px] rounded-md border border-slate-300 p-3 text-sm"
          value={draft1}
          onChange={(e) => setDraft('task1', e.target.value)}
          placeholder="Write at least 150 words…"
        />
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Task 2</div>
          <div className="pill bg-slate-100 text-slate-700">Word count: {wc.task2}</div>
        </div>
        <div className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{test.writing.task2.prompt}</div>
        <textarea
          className="mt-4 w-full min-h-[260px] rounded-md border border-slate-300 p-3 text-sm"
          value={draft2}
          onChange={(e) => setDraft('task2', e.target.value)}
          placeholder="Write at least 250 words…"
        />
      </div>
      <div className="text-xs text-slate-500">
        Model answers and rubric are hidden until you submit the full test.
      </div>
    </div>
  );
}

function SpeakingUI({ testId }: { testId: string }) {
  const test = tests[testId as keyof typeof tests];
  const notes = useAttemptStore((s) => s.speaking.notes);
  const setNotes = useAttemptStore((s) => s.actions.setSpeakingNotes);

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="text-sm font-semibold">Part 1</div>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {test.speaking.part1.topics.map((t) => (
            <div key={t.title} className="card p-4 bg-slate-50">
              <div className="font-semibold text-slate-900">{t.title}</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-800">
                {t.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="text-sm font-semibold">Part 2</div>
        <div className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{test.speaking.part2.cueCard}</div>
        <div className="mt-3 card p-3 bg-slate-50">
          <div className="text-xs font-semibold text-slate-700">1-minute preparation notes (example)</div>
          <ul className="mt-2 list-disc pl-5 text-xs text-slate-700">
            {test.speaking.part2.preparationNotesExample.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card p-6">
        <div className="text-sm font-semibold">Part 3</div>
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-800">
          {test.speaking.part3.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
        <div className="mt-4 text-xs text-slate-500">
          Optional recorder is included on the Results page (post-submit) to avoid distracting test flow in training centres.
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Notes (optional)</div>
          <div className="pill bg-slate-100 text-slate-700">Autosaved</div>
        </div>
        <textarea
          className="mt-3 w-full min-h-[120px] rounded-md border border-slate-300 p-3 text-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Use this area for teacher notes or self-reflection (not part of the official test)."
        />
      </div>
    </div>
  );
}

