import React from 'react';

export default function LevelBadge({ level, size = 'md' }) {
  const getLevelColor = (level) => {
    switch (level) {
      case 'A1':
      case 'A2':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'B1':
      case 'B2':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'C1':
      case 'C2':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelName = (level) => {
    switch (level) {
      case 'A1': return 'Beginner';
      case 'A2': return 'Elementary';
      case 'B1': return 'Intermediate';
      case 'B2': return 'Upper Intermediate';
      case 'C1': return 'Advanced';
      case 'C2': return 'Proficient';
      default: return 'Unknown';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className={`inline-flex items-center rounded-full border font-medium ${getLevelColor(level)} ${sizeClasses[size]}`}>
      <span className="font-bold">{level}</span>
      <span className="ml-1 text-xs opacity-75">{getLevelName(level)}</span>
    </div>
  );
}
