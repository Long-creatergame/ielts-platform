/**
 * Speaking Form Component
 * Renders IELTS Speaking test with cue card system based on blueprint
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VoiceRecorder from './VoiceRecorder';
import CountdownTimer from './CountdownTimer';

const SpeakingForm = ({ blueprint, mode, onSubmit, onTimeUp }) => {
  const [currentPart, setCurrentPart] = useState(0);
  const [timeLeft, setTimeLeft] = useState(blueprint?.timeLimit ? blueprint.timeLimit * 60 : 11 * 60);
  const [prepTimeLeft, setPrepTimeLeft] = useState(60);
  const [speakingTimeLeft, setSpeakingTimeLeft] = useState(120);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordings, setRecordings] = useState({}); // Store recordings for each part

  const parts = blueprint?.parts || [];

  const handleTimeTick = (newTime) => {
    setTimeLeft(newTime);
  };

  const handleTimeComplete = () => {
    if (onTimeUp) onTimeUp();
  };

  useEffect(() => {
    if (!isPreparing) return;
    
    const timer = setInterval(() => {
      setPrepTimeLeft(prev => {
        if (prev <= 1) {
          setIsPreparing(false);
          setIsSpeaking(true);
          setSpeakingTimeLeft(120); // Reset to 2 minutes
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPreparing]);

  useEffect(() => {
    if (!isSpeaking) return;
    
    const timer = setInterval(() => {
      setSpeakingTimeLeft(prev => {
        if (prev <= 0) {
          setIsSpeaking(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSpeaking]);

  const handleStartPreparation = () => {
    setIsPreparing(true);
    setPrepTimeLeft(parts[currentPart]?.preparation?.time || 60);
  };

  const handleRecordingComplete = (blob, url, partIndex) => {
    setRecordings(prev => ({
      ...prev,
      [partIndex]: { blob, url, timestamp: Date.now() }
    }));
  };

  const handleNextPart = () => {
    setIsPreparing(false);
    setIsSpeaking(false);
    setCurrentPart(prev => Math.min(parts.length - 1, prev + 1));
  };

  const handleSubmit = () => {
    if (!onSubmit) return;
    
    const submission = {
      skill: 'speaking',
      mode,
      recordings: recordings,
      timeSpent: blueprint?.timeLimit ? blueprint.timeLimit * 60 - timeLeft : 0,
      completedParts: Object.keys(recordings).length
    };
    
    onSubmit(submission);
  };

  if (!blueprint || !parts || parts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-red-600">No blueprint data available</p>
      </div>
    );
  }

  const currentPartData = parts[currentPart];
  const hasRecording = recordings[currentPart];

  return (
    <div className="space-y-6">
      {/* Header with Timer */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-lg p-6 border border-indigo-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              🎤 IELTS Speaking Test
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'academic' ? 'Academic' : 'General Training'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <CountdownTimer 
              duration={blueprint?.timeLimit ? blueprint.timeLimit * 60 : 11 * 60}
              onTick={handleTimeTick}
              onComplete={handleTimeComplete}
            />
          </div>
        </div>

        {/* Part Navigation */}
        <div className="flex gap-2">
          {parts.map((part, index) => (
            <button
              key={index}
              onClick={() => setCurrentPart(index)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                currentPart === index
                  ? 'bg-blue-600 text-white shadow-md'
                  : recordings[index]
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              {part.title || `Part ${part.partNumber || index + 1}`}
              <div className="text-xs mt-1 opacity-75">
                {recordings[index] && '✓'} {part.duration}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Part */}
      <motion.div
        key={currentPart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-bold text-blue-900 mb-2">
            {currentPartData.title || `Part ${currentPartData.partNumber || currentPart + 1}`}
          </h3>
          <p className="text-gray-700 text-sm mb-3">
            {currentPartData.instruction}
          </p>
          {currentPartData.duration && (
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Duration: {currentPartData.duration}
            </div>
          )}
        </div>

        {/* Part 1 or 3: Simple Questions */}
        {(currentPart === 0 || currentPart === 2) && (
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-900 font-medium mb-3">
                💬 {currentPartData.questionTypes?.[0]?.category || 'Your turn to speak'}
              </p>
              {currentPartData.questionTypes?.[0]?.examples && (
                <ul className="space-y-2 text-sm text-green-800">
                  {currentPartData.questionTypes[0].examples.slice(0, 3).map((q, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <VoiceRecorder
                onRecordingComplete={(blob, url) => handleRecordingComplete(blob, url, currentPart)}
                maxDuration={currentPart === 0 ? 60 : 300}
              />
            </div>

            {currentPartData.tips && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-900 text-sm">
                  💡 {currentPartData.tips}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Part 2: Cue Card */}
        {currentPart === 1 && (
          <div className="p-6 space-y-4">
            {!isPreparing && !isSpeaking && !hasRecording && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <p className="text-blue-900 font-semibold mb-4 text-lg">
                  📋 {currentPartData.preparation?.instruction || 'Get ready to speak'}
                </p>
                <button
                  onClick={handleStartPreparation}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg"
                >
                  ⏳ Start 1-Minute Preparation
                </button>
              </div>
            )}

            {/* Preparation Timer */}
            {isPreparing && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-300 rounded-lg p-8 text-center">
                <div className="text-6xl font-bold text-orange-600 mb-4">
                  {prepTimeLeft}
                </div>
                <p className="text-orange-900 font-semibold text-lg mb-4">
                  Preparation Time
                </p>
                <p className="text-sm text-orange-700">
                  {currentPartData.preparation?.instruction || 'Prepare your notes'}
                </p>

                {currentPartData.sampleTask && (
                  <div className="mt-6 bg-white border border-orange-200 rounded-lg p-6 text-left">
                    <h4 className="font-bold text-gray-900 mb-3">
                      📝 Topic: {currentPartData.sampleTask.topic}
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">You should say:</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {currentPartData.sampleTask.prompts?.map((prompt, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{prompt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Speaking Timer */}
            {isSpeaking && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-8 text-center">
                <div className="text-6xl font-bold text-green-600 mb-4">
                  {Math.floor(speakingTimeLeft / 60)}:{(speakingTimeLeft % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-green-900 font-semibold text-lg mb-4">
                  🎤 Keep Speaking!
                </p>
                <p className="text-sm text-green-700 mb-6">
                  {currentPartData.speakingTime?.warning || 'Speak for 1–2 minutes about the topic'}
                </p>

                <div className="bg-white border border-green-200 rounded-lg p-6 text-left mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">
                    📝 Topic: {currentPartData.sampleTask?.topic || 'Speaking topic'}
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {currentPartData.sampleTask?.prompts?.map((prompt, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{prompt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <VoiceRecorder
                  onRecordingComplete={(blob, url) => {
                    handleRecordingComplete(blob, url, currentPart);
                    setIsSpeaking(false);
                  }}
                  maxDuration={currentPartData.speakingTime?.max || 120}
                  autoStart={true}
                />
              </div>
            )}

            {/* Completed Recording */}
            {hasRecording && !isSpeaking && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-green-900 font-semibold">
                    ✓ Recording Completed
                  </p>
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ✓ Saved
                  </span>
                </div>
                <audio controls src={hasRecording.url} className="w-full">
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}

            {currentPartData.tips && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-900 text-sm">
                  💡 {currentPartData.tips}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentPart(Math.max(0, currentPart - 1))}
              disabled={currentPart === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                currentPart === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Previous Part
            </button>
            
            {currentPart < parts.length - 1 ? (
              <button
                onClick={handleNextPart}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Next Part →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(recordings).length !== parts.length}
                className={`px-8 py-3 rounded-lg font-bold transition-all duration-200 ${
                  Object.keys(recordings).length === parts.length
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Submit Test ✓
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Part Summary */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Part Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          {parts.map((part, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              recordings[index]
                ? 'bg-green-50 border-green-200'
                : index === currentPart
                ? 'bg-blue-50 border-blue-300'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">
                  {part.title || `Part ${part.partNumber || index + 1}`}
                </span>
                {recordings[index] && (
                  <span className="text-green-600 font-bold">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {recordings[index] ? 'Recording saved' : index === currentPart ? 'In progress' : 'Not started'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpeakingForm;
