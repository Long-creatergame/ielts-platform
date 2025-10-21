import React, { useEffect, useState } from 'react';

export default function Timer({ duration, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
      ⏱ {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
