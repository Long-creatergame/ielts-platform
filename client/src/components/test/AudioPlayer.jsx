import React, { useEffect, useRef, useState } from 'react';

export default function AudioPlayer({ src, testId = 'test', userId = 'guest', ...props }) {
  const audioRef = useRef(null);
  const [ready, setReady] = useState(false);
  const key = `audio-progress-${testId}-${userId}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { audio.currentTime = parseFloat(saved); } catch (_) {}
    }
    const saveProgress = () => {
      try { localStorage.setItem(key, String(audio.currentTime)); } catch (_) {}
    };
    audio.addEventListener('timeupdate', saveProgress);
    audio.addEventListener('loadeddata', () => setReady(true));
    return () => {
      audio.removeEventListener('timeupdate', saveProgress);
    };
  }, [key]);

  if (!src) return null;
  return (
    <div className="audio-player">
      <audio ref={audioRef} controls preload="auto" {...props}>
        <source src={src} type="audio/mpeg" />
      </audio>
    </div>
  );
}


