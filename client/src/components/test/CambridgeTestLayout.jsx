import React, { useEffect, useMemo, useState } from 'react';

function useCountdown(minutes = 60, onComplete) {
  const [remaining, setRemaining] = useState(minutes * 60);
  useEffect(() => {
    if (remaining <= 0) {
      onComplete && onComplete();
      return;
    }
    const t = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onComplete]);
  const mm = Math.floor(remaining / 60).toString().padStart(2, '0');
  const ss = (remaining % 60).toString().padStart(2, '0');
  return { remaining, label: `${mm}:${ss}`, setRemaining };
}

export default function CambridgeTestLayout({ skill = 'reading', setId = 'R1', onSubmit }) {
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/cambridge/test/${skill}/${setId}`);
        const json = await res.json();
        if (!json?.success) throw new Error(json?.message || 'Failed to load dataset');
        if (!mounted) return;
        setData(json.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [skill, setId]);

  const timingMinutes = useMemo(() => data?.timing || (skill === 'speaking' ? 12 : skill === 'listening' ? 40 : skill === 'reading' ? 60 : 60), [data, skill]);
  const { label } = useCountdown(timingMinutes, () => handleSubmit());
  const [currentSection, setCurrentSection] = useState(1);
  const progress = useMemo(() => {
    if (skill === 'listening' && data?.sections?.length) {
      return Math.round((index + 1) / data.sections.length * 100);
    }
    if (skill === 'reading' && data?.passages?.length) {
      return Math.round((index + 1) / data.passages.length * 100);
    }
    return 0;
  }, [skill, data, index]);

  function setAnswer(qid, value) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function next() { setIndex((i) => i + 1); }
  function prev() { setIndex((i) => Math.max(0, i - 1)); }

  async function handleSubmit() {
    try {
      const payload = { skill, setId, answers };
      // Endpoint may be implemented separately; fail gracefully
      await fetch('/api/assessment/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } finally {
      onSubmit && onSubmit({ skill, setId, answers });
      window.location.assign(`/review/${skill}`);
    }
  }

  if (loading) return <div>Loading Cambridge test...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Cambridge {skill.charAt(0).toUpperCase() + skill.slice(1)} Test</h1>
        <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-mono">{label}</div>
      </div>

      {skill === 'reading' && (
        <ReadingView data={data} index={index} setIndex={setIndex} onAnswer={setAnswer} answers={answers} />
      )}
      {skill === 'listening' && (
        <>
          <div className="mb-3 p-2 bg-blue-50 border rounded">
            <p>Now playing Section {index + 1}</p>
            <ProgressBar value={progress} max={100} />
          </div>
          <ListeningView data={data} index={index} setIndex={setIndex} onAnswer={setAnswer} answers={answers} />
        </>
      )}
      {skill === 'writing' && (
        <WritingView data={data} onAnswer={setAnswer} answers={answers} />
      )}
      {skill === 'speaking' && (
        <SpeakingView data={data} />
      )}

      <div className="mt-6 flex gap-2">
        <button onClick={prev} className="px-4 py-2 bg-gray-100 rounded" disabled={index === 0}>Prev</button>
        <button onClick={next} className="px-4 py-2 bg-gray-100 rounded">Next</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded ml-auto">Submit</button>
      </div>
    </div>
  );
}

function ReadingView({ data, index, setIndex, onAnswer, answers }) {
  const p = data.passages[index] || data.passages[0];
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{p.title}</h2>
      <p className="whitespace-pre-wrap mb-4">{p.text}</p>
      <div className="space-y-3">
        {p.questions?.map((q) => (
          <div key={q.id} className="p-3 border rounded">
            <div className="font-medium">{q.question}</div>
            {q.options?.map((opt) => (
              <label key={opt} className="mr-4 inline-flex items-center gap-1">
                <input type="radio" name={q.id} checked={answers[q.id] === opt} onChange={() => onAnswer(q.id, opt)} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 text-sm text-gray-500">Passage {index + 1} / {data.passages.length}</div>
    </div>
  );
}

function ListeningView({ data, index, setIndex, onAnswer, answers }) {
  const s = data.sections[index] || data.sections[0];
  return (
    <div>
      <audio src={s.audioUrl} controls preload="auto" />
      <p className="mt-2 text-gray-600">{s.transcript}</p>
      <div className="space-y-3 mt-3">
        {s.questions?.map((q) => (
          <div key={q.id} className="p-3 border rounded">
            <div className="font-medium mb-1">{q.question}</div>
            <input className="border rounded px-2 py-1 w-full" value={answers[q.id] || ''} onChange={(e) => onAnswer(q.id, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="mt-3 text-sm text-gray-500">Section {index + 1} / {data.sections.length}</div>
    </div>
  );
}

function ProgressBar({ value = 0, max = 100 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full h-2 bg-gray-200 rounded">
      <div className="h-2 bg-blue-600 rounded" style={{ width: pct + '%' }} />
    </div>
  );
}

function WritingView({ data, onAnswer, answers }) {
  const [text, setText] = useState(answers.task2 || '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  useEffect(() => { onAnswer('task2', text); }, [text]);
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Task 1</h3>
        {data.task1?.image && (<img src={data.task1.image} alt="Task 1 chart" className="max-w-full border rounded" />)}
        <p className="mt-2 text-gray-700">{data.task1?.prompt}</p>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Task 2</h3>
        <p className="mb-2 text-gray-700">{data.task2?.prompt}</p>
        <textarea className="w-full border rounded p-3 min-h-[200px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your essay here..." />
        <div className="text-sm text-gray-600 mt-1">Word count: {words}</div>
      </div>
    </div>
  );
}

function SpeakingView({ data }) {
  return (
    <div className="space-y-4">
      {data.parts?.map((p) => (
        <div key={p.part} className="p-3 border rounded">
          <div className="font-semibold">Part {p.part}</div>
          <div className="text-gray-700">{p.prompt}</div>
          <div className="text-xs text-gray-500 mt-1">Timer: {p.timer} min</div>
        </div>
      ))}
      <div className="p-3 rounded bg-yellow-50 text-yellow-800">Recording UI (SpeakingRecorder) can be integrated here.</div>
    </div>
  );
}


