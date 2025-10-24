import React, { useEffect, useState, useRef } from 'react';

export default function Timer({ duration, onTimeUp, onTimeChange }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [startTime, setStartTime] = useState(Date.now());
  const intervalRef = useRef(null);

  useEffect(() => {
    setStartTime(Date.now());
    
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onTimeUp();
          return 0;
        }
        const newTime = prev - 1;
        
        // Call onTimeChange callback if provided
        if (onTimeChange) {
          onTimeChange(newTime);
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [onTimeUp, onTimeChange]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
      ⏱ {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
