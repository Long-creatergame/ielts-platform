import fs from 'node:fs';
import path from 'node:path';

// Best-effort converter:
// - Reads src/data/raw/test1.txt
// - Attempts to extract answer keys for Listening/Reading (1..40)
// - If ambiguous or missing, logs warnings and keeps existing JSON.
//
// This is intentionally conservative: it ensures the app always has usable JSON.

const root = path.resolve(process.cwd(), '.');
const rawPath = path.join(root, 'src', 'data', 'raw', 'test1.txt');
const outPath = path.join(root, 'src', 'data', 'tests', 'test1.json');

function warn(msg, extra) {
  // eslint-disable-next-line no-console
  console.warn('[parse:test1]', msg, extra ?? '');
}

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function writeText(p, s) {
  fs.writeFileSync(p, s, 'utf8');
}

function parseAnswerKey(raw) {
  // Look for section "Answer Key" then parse lines like:
  // "### Listening Answers (1–40)" then "1. ..." or "1. ..."
  const lower = raw.toLowerCase();
  const idx = lower.indexOf('answer key');
  if (idx < 0) return null;
  const chunk = raw.slice(idx);

  function parseBlock(label) {
    const li = chunk.toLowerCase().indexOf(label.toLowerCase());
    if (li < 0) return null;
    const after = chunk.slice(li);
    const lines = after.split(/\r?\n/);
    const items = new Map();
    for (const line of lines) {
      const m = line.match(/^\s*(\d{1,2})\.\s+(.+?)\s*$/);
      if (!m) continue;
      const n = Number(m[1]);
      const ans = m[2].trim();
      if (n >= 1 && n <= 40) items.set(n, ans);
      if (items.size === 40) break;
    }
    if (items.size !== 40) return null;
    return Array.from({ length: 40 }, (_, i) => items.get(i + 1));
  }

  const listening = parseBlock('Listening Answers');
  const reading = parseBlock('Reading Answers');
  if (!listening) warn('Could not parse complete Listening answer key (1..40). Keeping existing JSON.');
  if (!reading) warn('Could not parse complete Reading answer key (1..40). Keeping existing JSON.');

  if (!listening || !reading) return null;
  return { listening, reading };
}

const raw = readText(rawPath);
let current = JSON.parse(readText(outPath));

const parsedKeys = parseAnswerKey(raw);
if (parsedKeys) {
  current.answerKeys = parsedKeys;
  warn('Updated answerKeys from raw text.');
} else {
  warn('No updates applied (best-effort parser).');
}

writeText(outPath, JSON.stringify(current, null, 2) + '\n');

