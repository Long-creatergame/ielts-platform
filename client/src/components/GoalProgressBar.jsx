import React from 'react';

export default function GoalProgressBar({ current, target, goal, className = '' }) {
  const progress = Math.min((current / target) * 100, 100);
  
  const getProgressColor = () => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getGoalIcon = (goal) => {
    switch (goal) {
      case 'Du học': return '🎓';
      case 'Định cư': return '🏠';
      case 'Việc làm': return '💼';
      case 'Thử sức': return '🎯';
      default: return '🎯';
    }
  };

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{getGoalIcon(goal)}</span>
          <span className="font-semibold text-gray-700">Mục tiêu: {goal}</span>
        </div>
        <span className="text-sm text-gray-500">
          {current.toFixed(1)} / {target} Band
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="text-xs text-gray-600 text-center">
        {progress >= 100 ? '🎉 Đã đạt mục tiêu!' : `Còn ${(target - current).toFixed(1)} band nữa`}
      </div>
    </div>
  );
}
