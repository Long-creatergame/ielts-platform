import type { IELTSAcademicTest } from './schema';

function normaliseWord(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/\u00a0/g, ' ');
}

function normaliseNumericLoose(s: string): string {
  // For numbers/phones: ignore spaces and common separators
  return s.trim().toLowerCase().replace(/[\s\-()]/g, '');
}

function splitAlternatives(answerKey: string): string[] {
  // Accept "ten / 10" or "4 to 6"
  return answerKey
    .split('/')
    .map((x) => x.trim())
    .filter(Boolean);
}

export type ModuleKey = 'listening' | 'reading';

export function isCorrect(
  userRaw: string | undefined,
  correctRaw: string,
  opts?: { strictTFNG?: boolean }
): boolean {
  if (!userRaw) return false;
  const user = userRaw.trim();
  if (!user) return false;

  const alts = splitAlternatives(correctRaw);
  const userNorm = normaliseWord(user);

  if (opts?.strictTFNG) {
    const u = userNorm.toUpperCase();
    const cAlts = alts.map((a) => normaliseWord(a).toUpperCase());
    return cAlts.includes(u);
  }

  // Try word-normalised match first
  const wordAlts = alts.map((a) => normaliseWord(a));
  if (wordAlts.includes(userNorm)) return true;

  // Then try loose numeric formatting match (phones, numbers)
  const userNum = normaliseNumericLoose(user);
  const numAlts = alts.map((a) => normaliseNumericLoose(a));
  return numAlts.includes(userNum);
}

export function estimateBandFromRaw(raw: number, test: IELTSAcademicTest): number {
  const row = test.bandGuide.listeningReadingRawToBand.find((r) => raw >= r.min && raw <= r.max);
  return row?.band ?? 0;
}

export function scoreModule(
  module: ModuleKey,
  answersById: Record<number, string | undefined>,
  test: IELTSAcademicTest
): { raw: number; band: number; details: Array<{ id: number; correct: string; user?: string; ok: boolean }> } {
  const keys = module === 'listening' ? test.answerKeys.listening : test.answerKeys.reading;
  let raw = 0;
  const details = keys.map((correct, idx) => {
    const id = idx + 1;
    const user = answersById[id];
    const strictTFNG = module === 'reading' && /^TRUE|FALSE|NOT GIVEN$/i.test(correct.trim());
    const ok = isCorrect(user, correct, { strictTFNG });
    if (ok) raw += 1;
    return { id, correct, user, ok };
  });
  return { raw, band: estimateBandFromRaw(raw, test), details };
}

