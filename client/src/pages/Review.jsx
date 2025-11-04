import React, { useEffect, useState } from 'react';

export default function Review() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  // Optionally fetch review data from an endpoint, or show static placeholder
  useEffect(() => {
    // Placeholder: integrate with /api/assessment/result and /api/learningpath/generate
  }, []);
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Review Mode</h1>
      <div className="space-y-3">
        <div className="p-3 border rounded">
          <div className="font-semibold">Correct Answers</div>
          <div className="text-gray-600">Shown after submission (Reading/Listening)</div>
        </div>
        <div className="p-3 border rounded">
          <div className="font-semibold">AI Feedback</div>
          <div className="text-gray-600">Writing/Speaking rubric-based comments</div>
        </div>
        <div className="p-3 border rounded">
          <div className="font-semibold">Band Breakdown</div>
          <div className="text-gray-600">Reading/Listening mapped from 40; Writing/Speaking by criteria</div>
        </div>
        <button className="px-4 py-2 rounded bg-blue-600 text-white">Generate Learning Path</button>
      </div>
    </div>
  );
}


