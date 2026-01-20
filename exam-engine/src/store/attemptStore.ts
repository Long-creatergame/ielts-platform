import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModuleKey } from '../utils/scoring';

export type Mode = 'computer' | 'paper';
export type Module = 'listening' | 'reading' | 'writing' | 'speaking';

export type AnswerValue =
  | { kind: 'text'; value: string }
  | { kind: 'choice'; value: string } // A/B/C or option key
  | { kind: 'dropdown'; value: string };

export type AttemptState = {
  version: 1;
  testId: string | null;
  mode: Mode;
  module: Module | null;
  startedAt: number | null;
  moduleStartedAt: Partial<Record<Module, number>>;
  moduleTimeLeftSec: Partial<Record<Module, number>>;
  answers: Record<number, AnswerValue | undefined>; // 1..40 for L/R; writing uses separate drafts
  flagged: Record<number, boolean | undefined>;
  currentQuestionId: number;
  lastSavedAt: number | null;
  submittedAt: number | null;
  moduleSubmittedAt: Partial<Record<ModuleKey, number>>;
  writingDrafts: {
    task1: string;
    task2: string;
    lastWordCount: { task1: number; task2: number };
  };
  speaking: {
    notes: string;
    micPermission: 'unknown' | 'granted' | 'denied';
    recordings: Array<{ id: string; createdAt: number; blobUrl: string }>;
  };
  actions: {
    startNewAttempt: (testId: string, mode: Mode) => void;
    resumeAttempt: () => void;
    resetAttempt: () => void;
    setMode: (mode: Mode) => void;
    enterModule: (module: Module, timeLeftSec: number) => void;
    tick: (module: Module) => void;
    setCurrentQuestion: (id: number) => void;
    setAnswer: (id: number, value: AnswerValue) => void;
    clearAnswer: (id: number) => void;
    toggleFlag: (id: number) => void;
    touchAutosave: () => void;
    submitModule: (module: ModuleKey) => void;
    submitAll: () => void;
    setWritingDraft: (task: 'task1' | 'task2', text: string) => void;
    setSpeakingNotes: (text: string) => void;
    setMicPermission: (p: 'unknown' | 'granted' | 'denied') => void;
    addRecording: (r: { id: string; createdAt: number; blobUrl: string }) => void;
    removeRecording: (id: string) => void;
  };
};

const initialState: Omit<AttemptState, 'actions'> = {
  version: 1,
  testId: null,
  mode: 'computer',
  module: null,
  startedAt: null,
  moduleStartedAt: {},
  moduleTimeLeftSec: {},
  answers: {},
  flagged: {},
  currentQuestionId: 1,
  lastSavedAt: null,
  submittedAt: null,
  moduleSubmittedAt: {},
  writingDrafts: {
    task1: '',
    task2: '',
    lastWordCount: { task1: 0, task2: 0 },
  },
  speaking: {
    notes: '',
    micPermission: 'unknown',
    recordings: [],
  },
};

export const useAttemptStore = create<AttemptState>()(
  persist(
    (set, get) => ({
      ...initialState,
      actions: {
        startNewAttempt(testId, mode) {
          set({
            ...initialState,
            testId,
            mode,
            startedAt: Date.now(),
            lastSavedAt: Date.now(),
          });
        },
        resumeAttempt() {
          set({ lastSavedAt: Date.now() });
        },
        resetAttempt() {
          // Revoke blob URLs to avoid memory leaks (best-effort)
          const recs = get().speaking.recordings;
          for (const r of recs) {
            try {
              URL.revokeObjectURL(r.blobUrl);
            } catch {
              // ignore
            }
          }
          set({ ...initialState });
        },
        setMode(mode) {
          set({ mode, lastSavedAt: Date.now() });
        },
        enterModule(module, timeLeftSec) {
          const now = Date.now();
          set((s) => ({
            module,
            moduleStartedAt: { ...s.moduleStartedAt, [module]: now },
            moduleTimeLeftSec: { ...s.moduleTimeLeftSec, [module]: timeLeftSec },
            currentQuestionId: 1,
            lastSavedAt: now,
          }));
        },
        tick(module) {
          const startedAt = get().moduleStartedAt[module];
          const initial = get().moduleTimeLeftSec[module];
          if (!startedAt || typeof initial !== 'number') return;
          const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
          const left = Math.max(0, initial - elapsedSec);
          set((s) => ({
            moduleTimeLeftSec: { ...s.moduleTimeLeftSec, [module]: left },
          }));
        },
        setCurrentQuestion(id) {
          set({ currentQuestionId: id, lastSavedAt: Date.now() });
        },
        setAnswer(id, value) {
          set((s) => ({ answers: { ...s.answers, [id]: value }, lastSavedAt: Date.now() }));
        },
        clearAnswer(id) {
          set((s) => {
            const next = { ...s.answers };
            delete next[id];
            return { answers: next, lastSavedAt: Date.now() };
          });
        },
        toggleFlag(id) {
          set((s) => ({ flagged: { ...s.flagged, [id]: !s.flagged[id] }, lastSavedAt: Date.now() }));
        },
        touchAutosave() {
          set({ lastSavedAt: Date.now() });
        },
        submitModule(module) {
          set((s) => ({
            moduleSubmittedAt: { ...s.moduleSubmittedAt, [module]: Date.now() },
            lastSavedAt: Date.now(),
          }));
        },
        submitAll() {
          set({ submittedAt: Date.now(), lastSavedAt: Date.now() });
        },
        setWritingDraft(task, text) {
          const wc = wordCount(text);
          set((s) => ({
            writingDrafts: {
              ...s.writingDrafts,
              [task]: text,
              lastWordCount: { ...s.writingDrafts.lastWordCount, [task]: wc },
            },
            lastSavedAt: Date.now(),
          }));
        },
        setSpeakingNotes(text) {
          set((s) => ({
            speaking: { ...s.speaking, notes: text },
            lastSavedAt: Date.now(),
          }));
        },
        setMicPermission(p) {
          set((s) => ({ speaking: { ...s.speaking, micPermission: p }, lastSavedAt: Date.now() }));
        },
        addRecording(r) {
          set((s) => ({
            speaking: { ...s.speaking, recordings: [r, ...s.speaking.recordings] },
            lastSavedAt: Date.now(),
          }));
        },
        removeRecording(id) {
          set((s) => {
            const rec = s.speaking.recordings.find((x) => x.id === id);
            if (rec) {
              try {
                URL.revokeObjectURL(rec.blobUrl);
              } catch {
                // ignore
              }
            }
            return {
              speaking: { ...s.speaking, recordings: s.speaking.recordings.filter((x) => x.id !== id) },
              lastSavedAt: Date.now(),
            };
          });
        },
      },
    }),
    {
      name: 'ielts_mock_attempt_v1',
      partialize: (s) => ({
        version: s.version,
        testId: s.testId,
        mode: s.mode,
        module: s.module,
        startedAt: s.startedAt,
        moduleStartedAt: s.moduleStartedAt,
        moduleTimeLeftSec: s.moduleTimeLeftSec,
        answers: s.answers,
        flagged: s.flagged,
        currentQuestionId: s.currentQuestionId,
        lastSavedAt: s.lastSavedAt,
        submittedAt: s.submittedAt,
        moduleSubmittedAt: s.moduleSubmittedAt,
        writingDrafts: s.writingDrafts,
        speaking: {
          // IMPORTANT: blob URLs may not survive refresh; keep list but user may need to re-record.
          ...s.speaking,
        },
      }),
    }
  )
);

export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

