import React, { useEffect, useRef, useState } from 'react';

export default function SpeakingRecorder({ onRecorded }) {
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');

  async function start() {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        onRecorded && onRecorded(blob);
      };
      mr.start();
      setRecording(true);
    } catch (e) {
      setError(e.message);
    }
  }

  function stop() {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') mr.stop();
    setRecording(false);
  }

  return (
    <div className="p-3 border rounded">
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="flex gap-2">
        <button onClick={start} disabled={recording} className="px-3 py-1 rounded bg-green-600 text-white">Start</button>
        <button onClick={stop} disabled={!recording} className="px-3 py-1 rounded bg-red-600 text-white">Stop</button>
      </div>
    </div>
  );
}


