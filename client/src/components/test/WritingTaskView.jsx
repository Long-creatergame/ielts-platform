import React, { useEffect, useState } from 'react';

export default function WritingTaskView({ task1, task2, value, onChange, imageUrls = [] }) {
  const [task1Text, setTask1Text] = useState(value?.task1 || '');
  const [task2Text, setTask2Text] = useState(value?.task2 || '');
  
  const task1Words = task1Text.trim().split(/\s+/).filter(Boolean).length;
  const task2Words = task2Text.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (onChange) {
      onChange({ task1: task1Text, task2: task2Text });
    }
  }, [task1Text, task2Text, onChange]);

  // Build image URL from task1 or imageUrls
  const getImageUrl = () => {
    if (imageUrls?.length > 0) {
      return imageUrls.map(url => {
        if (url.startsWith('/api/media')) return url;
        const filename = url.split('/').pop();
        return `/api/media/image/${filename}`;
      });
    }
    if (task1?.image) {
      const filename = task1.image.split('/').pop();
      return [`/api/media/image/${filename}`];
    }
    return [];
  };

  const imageUrlList = getImageUrl();

  return (
    <div className="space-y-8">
      {/* Task 1 */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Task 1</h3>
            <span className="text-sm text-gray-500">Minimum 150 words</span>
        </div>
        
        {imageUrlList.length > 0 && (
          <div className="mb-4 space-y-3">
            {imageUrlList.map((img, i) => (
              <div key={i} className="writing-chart">
                <img 
                  src={img} 
                  alt={`Task 1 chart ${i + 1}`} 
                  className="w-full rounded-lg shadow border max-h-96 object-contain bg-gray-50"
                  onError={(e) => {
                    e.target.src = '/images/charts/placeholder.png';
                    e.target.alt = 'Chart not available';
                  }}
                />
              </div>
            ))}
          </div>
        )}
        
        <p className="mb-4 text-gray-700 leading-relaxed">{task1?.prompt || 'Summarize the information by selecting and reporting the main features.'}</p>
        
        <textarea
          className="w-full border rounded-lg p-4 min-h-[200px] font-mono text-sm"
          value={task1Text}
          onChange={(e) => setTask1Text(e.target.value)}
          placeholder="Write your Task 1 response here (minimum 150 words)..."
        />
        <div className="flex justify-between items-center mt-2">
          <div className={`text-sm ${task1Words < 150 ? 'text-red-600' : 'text-green-600'}`}>
            Word count: {task1Words} / 150
          </div>
          {task1Words < 150 && (
            <span className="text-xs text-red-500">⚠️ Below minimum</span>
          )}
        </div>
      </div>

      {/* Task 2 */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Task 2</h3>
          <span className="text-sm text-gray-500">Minimum 250 words</span>
        </div>
        
        <p className="mb-4 text-gray-700 leading-relaxed">{task2?.prompt || 'Write an essay on the following topic.'}</p>
        
        <textarea
          className="w-full border rounded-lg p-4 min-h-[300px] font-mono text-sm"
          value={task2Text}
          onChange={(e) => setTask2Text(e.target.value)}
          placeholder="Write your Task 2 essay here (minimum 250 words)..."
        />
        <div className="flex justify-between items-center mt-2">
          <div className={`text-sm ${task2Words < 250 ? 'text-red-600' : 'text-green-600'}`}>
            Word count: {task2Words} / 250
          </div>
          {task2Words < 250 && (
            <span className="text-xs text-red-500">⚠️ Below minimum</span>
          )}
        </div>
      </div>
    </div>
  );
}


