import React, { useState, useRef, useEffect } from 'react';

export default function SpeakingView({ testData, answers, onChange, onTimeout }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [micPermission, setMicPermission] = useState(null);
  
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const questions = testData?.questions || testData?.parts || [];
  const currentQuestionData = questions[currentQuestion] || {};

  useEffect(() => {
    // Check microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setMicPermission(true);
      })
      .catch(() => {
        setMicPermission(false);
      });

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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onTimeout]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Convert blob to base64 for submission (or handle differently)
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          if (onChange) {
            onChange({
              ...answers,
              [currentQuestion]: base64data
            });
          }
        };
        reader.readAsDataURL(blob);
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setMicPermission(true);
    } catch (error) {
      console.error('[SpeakingView] Recording error:', error);
      setMicPermission(false);
      alert('Microphone access denied. Please enable microphone permissions in your browser settings.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recording) {
      recorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setRecording(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAudioBlob(null);
      setAudioUrl(null);
      if (recording) stopRecording();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAudioBlob(null);
      setAudioUrl(null);
      if (recording) stopRecording();
    }
  };

  // Mock mode if no mic permission
  const handleMockRecording = () => {
    if (micPermission === false) {
      const mockAnswer = `Mock answer for question ${currentQuestion + 1}: ${currentQuestionData.question || 'Speaking response'}`;
      if (onChange) {
        onChange({
          ...answers,
          [currentQuestion]: mockAnswer
        });
      }
      alert('Microphone not available. Using mock response for demo purposes.');
    }
  };

  return (
    <div className="speaking-view space-y-6">
      {/* Timer Bar */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-purple-700">Time Remaining</span>
          <span className="text-2xl font-bold text-purple-600">{formatTime(timeLeft)}</span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${(timeLeft / 900) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Question {currentQuestion + 1}</h3>
          <span className="text-sm text-gray-500">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>
        
        <div className="mb-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            {currentQuestionData.question || currentQuestionData.prompt || 'Please answer the following question.'}
          </p>
          {currentQuestionData.instructions && (
            <p className="text-sm text-gray-500 mt-2 italic">
              {currentQuestionData.instructions}
            </p>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col items-center gap-4">
          {micPermission === false && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 w-full text-center">
              ⚠️ Microphone access denied. Mock mode available for demo.
            </div>
          )}

          {!recording && !audioBlob && (
            <div className="flex gap-3">
              <button
                onClick={startRecording}
                disabled={micPermission === false}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎤 Start Recording
              </button>
              {micPermission === false && (
                <button
                  onClick={handleMockRecording}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  📝 Use Mock Response
                </button>
              )}
            </div>
          )}

          {recording && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="font-semibold">Recording...</span>
              </div>
              <button
                onClick={stopRecording}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                ⏹ Stop Recording
              </button>
            </div>
          )}

          {audioBlob && audioUrl && (
            <div className="w-full space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 text-center">
                ✅ Recording complete! Listen to your response below.
              </div>
              <audio controls src={audioUrl} className="w-full" />
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  🔄 Record Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestion === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous Question
        </button>
        <button
          onClick={handleNextQuestion}
          disabled={currentQuestion >= questions.length - 1}
          className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Question →
        </button>
      </div>
    </div>
  );
}

