/**
 * Listening Form Component
 * Renders IELTS Listening test with audio sections based on blueprint
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AudioPlayer from './AudioPlayer';
import CountdownTimer from './CountdownTimer';
import QuestionCard from './QuestionCard';

const ListeningForm = ({ blueprint, mode, onSubmit, onTimeUp }) => {
  const [answers, setAnswers] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [timeLeft, setTimeLeft] = useState(blueprint?.timeLimit ? blueprint.timeLimit * 60 : 30 * 60);
  const [audioPlayed, setAudioPlayed] = useState([]); // Track which sections have been played
  const [currentAudio, setCurrentAudio] = useState(null);

  const sections = blueprint?.sections || [];
  const totalQuestions = blueprint?.totalQuestions || 40;

  const handleTimeTick = (newTime) => {
    setTimeLeft(newTime);
  };

  const handleTimeComplete = () => {
    if (onTimeUp) onTimeUp();
  };

  const handlePlayAudio = (sectionIndex) => {
    if (blueprint.playOnce && audioPlayed.includes(sectionIndex)) {
      alert('⚠️ Audio can only be played once! This mimics the real IELTS test.');
      return;
    }
    
    setCurrentAudio(sections[sectionIndex].audio);
    if (!audioPlayed.includes(sectionIndex)) {
      setAudioPlayed([...audioPlayed, sectionIndex]);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleSubmit = () => {
    if (!onSubmit) return;
    
    const submission = {
      skill: 'listening',
      mode,
      answers: answers,
      timeSpent: blueprint?.timeLimit ? blueprint.timeLimit * 60 - timeLeft : 0,
      audioPlayed: audioPlayed
    };
    
    onSubmit(submission);
  };

  if (!blueprint || !sections || sections.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-red-600">No blueprint data available</p>
      </div>
    );
  }

  const currentSectionData = sections[currentSection];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      {/* Header with Timer */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-lg p-6 border border-indigo-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              🎧 IELTS Listening Test
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'academic' ? 'Academic' : 'General Training'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <CountdownTimer 
              duration={blueprint?.timeLimit ? blueprint.timeLimit * 60 : 30 * 60}
              onTick={handleTimeTick}
              onComplete={handleTimeComplete}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
          <p className="text-red-900 text-sm font-medium">
            ⚠️ {blueprint.instructionText || 'You will hear each recording ONCE only. Listen carefully and answer the questions.'}
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Answered: {answeredCount} / {totalQuestions}</span>
          <span>Audio played: {audioPlayed.length} / {sections.length} sections</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* Section Navigation */}
        <div className="flex gap-2 mt-4">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                currentSection === index
                  ? 'bg-blue-600 text-white shadow-md'
                  : audioPlayed.includes(index)
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              {section.title || `Section ${section.sectionNumber || index + 1}`}
              <div className="text-xs mt-1 opacity-75">
                {audioPlayed.includes(index) && '✓'} {section.questionCount || 0} questions
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Section */}
      <motion.div
        key={currentSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-bold text-blue-900 mb-2">
            {currentSectionData.title || `Section ${currentSection + 1}`}
          </h3>
          {currentSectionData.context && (
            <p className="text-gray-700 text-sm">{currentSectionData.context}</p>
          )}
        </div>

        {/* Audio Player */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">🎵 Audio Recording:</h4>
            {audioPlayed.includes(currentSection) && (
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                ✓ Played
              </span>
            )}
          </div>
          
          {currentAudio && (
            <div className="mb-4">
              <AudioPlayer 
                audioUrl={currentAudio || '/api/audio/listening-sample.mp3'}
                autoPlay={!audioPlayed.includes(currentSection)}
              />
            </div>
          )}
          
          <button
            onClick={() => handlePlayAudio(currentSection)}
            disabled={blueprint.playOnce && audioPlayed.includes(currentSection)}
            className={`w-full py-3 px-6 rounded-lg font-bold transition-all duration-200 ${
              blueprint.playOnce && audioPlayed.includes(currentSection)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
            }`}
          >
            {audioPlayed.includes(currentSection) 
              ? '✓ Audio Already Played (Play Once Only)'
              : '▶️ Play Audio Now'}
          </button>
          
          {blueprint.playOnce && !audioPlayed.includes(currentSection) && (
            <p className="text-sm text-red-700 mt-2 font-medium">
              ⚠️ You can only play this audio ONCE. Ready? Click the button above when you're ready to listen.
            </p>
          )}
        </div>

        {/* Questions */}
        <div className="p-6 space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Questions {currentSectionData.questionCount || 0}:</h4>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-900 font-medium mb-4">
              📝 Answer the questions below based on what you hear in the audio.
            </p>
            <div className="space-y-3">
              {Array.from({ length: currentSectionData.questionCount || 10 }, (_, qIndex) => (
                <QuestionCard
                  key={qIndex}
                  question={{ question: `Listening Question ${qIndex + 1}` }}
                  index={qIndex + 1}
                  onAnswerChange={(value) => handleAnswerChange(`section_${currentSection}_q${qIndex}`, value)}
                  value={answers[`section_${currentSection}_q${qIndex}`]}
                  disabled={!audioPlayed.includes(currentSection)}
                />
              ))}
            </div>
            
            {!audioPlayed.includes(currentSection) && (
              <p className="text-sm text-gray-600 mt-4">
                🔊 Listen to the audio above before answering the questions
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                currentSection === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Previous Section
            </button>
            
            {currentSection < sections.length - 1 ? (
              <button
                onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Next Section →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg"
              >
                Submit Test ✓
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Section Summary */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Section Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          {sections.map((section, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              audioPlayed.includes(index)
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">
                  {section.title || `Section ${section.sectionNumber || index + 1}`}
                </span>
                {audioPlayed.includes(index) && (
                  <span className="text-green-600 font-bold">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {audioPlayed.includes(index) ? 'Audio played' : 'Audio not played yet'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListeningForm;
