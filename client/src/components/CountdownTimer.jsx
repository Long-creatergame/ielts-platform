/**
 * CountdownTimer Component
 * Circular countdown timer with visual progress and color changes
 */

import { useEffect, useState } from 'react';

export default function CountdownTimer({ duration, onComplete, onTick, className = "" }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / duration) * circumference;

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(t => {
        const newTime = t - 1;
        if (onTick && newTime >= 0) {
          onTick(newTime);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onComplete, onTick]);

  const getColor = () => {
    const percent = timeLeft / duration;
    if (percent > 0.5) return '#35b86d'; // Green
    if (percent > 0.2) return '#f7c948'; // Yellow
    return '#f05252'; // Red
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`relative w-24 h-24 ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle 
          cx="50" 
          cy="50" 
          r={radius} 
          stroke="#e5e7eb" 
          strokeWidth="6" 
          fill="none" 
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={getColor()}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className="transition-all duration-300 ease-linear"
        />
      </svg>
      {/* Time display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 leading-none">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            left
          </div>
        </div>
      </div>
    </div>
  );
}
