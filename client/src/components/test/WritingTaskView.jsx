import React, { useEffect, useState } from 'react';

export default function WritingTaskView({ task1, task2, value, onChange, imageUrls = [] }) {
  const [text, setText] = useState(value || '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  useEffect(() => { onChange && onChange(text); }, [text]);
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Task 1</h3>
        {imageUrls?.length > 0 ? (
          imageUrls.map((img, i) => (
            <div key={i} className="writing-chart mb-3">
              <img src={img} alt={`Task 1 chart ${i + 1}`} className="w-full rounded-lg shadow" />
            </div>
          ))
        ) : (
          task1?.image && (<img src={task1.image} alt="Task 1 chart" className="max-w-full border rounded" />)
        )}
        <p className="mt-2 text-gray-700">{task1?.prompt}</p>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Task 2</h3>
        <p className="mb-2 text-gray-700">{task2?.prompt}</p>
        <textarea className="w-full border rounded p-3 min-h-[200px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your essay here..." />
        <div className="text-sm text-gray-600 mt-1">Word count: {words}</div>
      </div>
    </div>
  );
}


