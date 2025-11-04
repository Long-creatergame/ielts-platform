import React, { useEffect, useState } from 'react';

export default function ExamTimer({ duration = 60, onTimeout }) {
  const [remaining, setRemaining] = useState(duration * 60);
  useEffect(() => {
    if (remaining <= 0) {
      onTimeout && onTimeout();
      return;
    }
    const t = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onTimeout]);
  const mm = Math.floor(remaining / 60).toString().padStart(2, '0');
  const ss = (remaining % 60).toString().padStart(2, '0');
  const pct = Math.max(0, Math.min(100, (remaining / (duration * 60)) * 100));
  const color = pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="w-full">
      <div className="w-full h-2 bg-gray-200 rounded">
        <div className={`h-2 ${color} rounded`} style={{ width: pct + '%' }} />
      </div>
      <div className="text-right text-sm mt-1 font-mono">{mm}:{ss}</div>
    </div>
  );
}


