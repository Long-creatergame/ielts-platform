import React from 'react';

export default function ScoreCard({ title, score, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6 text-center`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="text-4xl font-bold mb-2">{score}</div>
      <p className="text-sm opacity-75">Band Score</p>
    </div>
  );
}
