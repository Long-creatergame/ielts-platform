import React, { useEffect, useState } from 'react';
import ExamTimer from './ExamTimer';

export default function ExamModeLayout({ mode = 'cambridge', skill = 'reading', onSubmit }) {
  const [session, setSession] = useState(null);
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/exam/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, skill })
        });
        const json = await res.json();
        if (!json?.success) throw new Error(json?.message || 'Failed to start exam');
        setSession(json.data.sessionId);
        setTest(json.data.test);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, skill]);

  async function handleSubmit() {
    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session, answers })
      });
      const json = await res.json();
      onSubmit && onSubmit(json);
    } catch (_) {}
  }

  if (loading) return <div>Loading exam...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!test) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{mode === 'cambridge' ? 'Cambridge' : 'Practice'} {skill}</h1>
        <ExamTimer duration={skill === 'listening' ? 40 : skill === 'reading' ? 60 : 60} onTimeout={handleSubmit} />
      </div>
      <div className="mb-4 p-3 border rounded">Render test content here</div>
      <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
    </div>
  );
}


