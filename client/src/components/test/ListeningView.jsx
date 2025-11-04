import React, { useState, useEffect, useRef } from 'react';

export default function ListeningView({ testData, answers, onChange, onTimeout }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const sections = testData?.sections || [];
  const currentSectionData = sections[currentSection] || {};

  useEffect(() => {
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (onTimeout) onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onTimeout]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioPlay = () => setIsPlaying(true);
  const handleAudioPause = () => setIsPlaying(false);
  const handleAudioEnded = () => setIsPlaying(false);

  const handleTimeUpdate = (e) => {
    const audio = e.target;
    if (audio.duration) {
      setAudioProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    onChange(newAnswers);
  };

  const handleNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setAudioProgress(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setAudioProgress(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.warn('[ListeningView] Auto-play prevented:', err);
      });
    }
  };

  // Build audio URL from section data
  const audioUrl = currentSectionData.audioUrl 
    ? `/api/media/audio/${currentSectionData.audioUrl.split('/').pop()}`
    : currentSectionData.audio 
    ? `/api/media/audio/${currentSectionData.audio.split('/').pop()}`
    : null;

  return (
    <div className="listening-view space-y-6">
      {/* Timer Bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-blue-700">Time Remaining</span>
          <span className="text-2xl font-bold text-blue-600">{formatTime(timeLeft)}</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(timeLeft / 900) * 100}%` }}
          />
        </div>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Section {currentSection + 1}</h3>
              <p className="text-sm text-gray-600">{currentSectionData.title || `Listening Section ${currentSection + 1}`}</p>
            </div>
            <div className="text-sm text-gray-500">
              {currentSection + 1} / {sections.length}
            </div>
          </div>
          
          <audio
            id="listening-audio"
            ref={audioRef}
            controls
            preload="auto"
            src={audioUrl}
            onPlay={handleAudioPlay}
            onPause={handleAudioPause}
            onEnded={handleAudioEnded}
            onTimeUpdate={handleTimeUpdate}
            className="w-full"
          >
            Your browser does not support the audio element.
          </audio>

          <div className="listening-controls flex gap-2 mt-3">
            <button
              onClick={handleReplay}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🔄 Replay Section
            </button>
          </div>

          {audioProgress > 0 && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Questions</h3>
        {currentSectionData.questions?.map((question, idx) => {
          const questionId = question.id || `q${currentSection}_${idx}`;
          const currentAnswer = answers[questionId] || '';

          return (
            <div key={questionId} className="bg-white border rounded-lg p-4">
              <div className="mb-2">
                <span className="font-semibold">Question {idx + 1}:</span>
                <p className="mt-1">{question.question}</p>
              </div>

              {question.type === 'multiple_choice' || question.options ? (
                <div className="space-y-2">
                  {(question.options || []).map((option, optIdx) => (
                    <label key={optIdx} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={questionId}
                        value={option}
                        checked={currentAnswer === option}
                        onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                        className="w-4 h-4"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full border rounded px-3 py-2 mt-2"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Section Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevSection}
          disabled={currentSection === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous Section
        </button>
        <button
          onClick={handleNextSection}
          disabled={currentSection >= sections.length - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Section →
        </button>
      </div>
    </div>
  );
}

