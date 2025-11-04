import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ExamResult() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/exam/result/${sessionId}`);
        const json = await res.json();
        if (!json?.success) throw new Error(json?.message || 'Failed to load result');
        setData(json.data);
      } catch (e) { setError(e.message); }
    })();
  }, [sessionId]);
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return <div>Loading result...</div>;
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Exam Result</h1>
      <pre className="bg-gray-50 p-3 rounded border">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}


