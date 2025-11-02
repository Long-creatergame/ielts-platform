/**
 * Reading Form Component
 * Renders IELTS Reading test with passages and questions based on blueprint
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountdownTimer from './CountdownTimer';
import QuestionCard from './QuestionCard';
import ReadingPassageCard from './ReadingPassageCard';

const ReadingForm = ({ blueprint, mode, onSubmit, onTimeUp }) => {
  const [answers, setAnswers] = useState({});
  const [currentPassage, setCurrentPassage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(blueprint?.timeLimit ? blueprint.timeLimit * 60 : 60 * 60);

  const sections = blueprint?.sections || [];
  const totalQuestions = blueprint?.totalQuestions || 40;

  const handleTimeTick = (newTime) => {
    setTimeLeft(newTime);
  };

  const handleTimeComplete = () => {
    if (onTimeUp) onTimeUp();
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
      skill: 'reading',
      mode,
      answers: answers,
      timeSpent: blueprint?.timeLimit ? blueprint.timeLimit * 60 - timeLeft : 0
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

  const currentSection = sections[currentPassage];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      {/* Header with Timer */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-lg p-6 border border-indigo-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              📖 IELTS Reading Test
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'academic' ? 'Academic' : 'General Training'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <CountdownTimer 
              duration={blueprint?.timeLimit ? blueprint.timeLimit * 60 : 60 * 60}
              onTick={handleTimeTick}
              onComplete={handleTimeComplete}
            />
          </div>
        </div>

        {/* Instructions */}
        {blueprint.timeWarning && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-4">
            <p className="text-blue-900 text-sm font-medium">
              📋 {blueprint.timeWarning}
            </p>
          </div>
        )}

        {/* Progress */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Answered: {answeredCount} / {totalQuestions}</span>
          <span>{sections.length} sections</span>
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
              onClick={() => setCurrentPassage(index)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                currentPassage === index
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              {section.title || `Section ${section.sectionNumber || index + 1}`}
              <div className="text-xs mt-1 opacity-75">
                {section.questionCount || 0} questions
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cambridge 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Reading Passage */}
        <div className="lg:sticky lg:top-4 h-fit max-h-[calc(100vh-200px)] overflow-y-auto bg-white rounded-xl shadow-md p-6 border border-indigo-100">
          <ReadingPassageCard 
            passage={currentSection.passage}
            title={currentSection.title || `Passage ${currentPassage + 1}`}
            instructions={currentSection.description}
          />
        </div>

        {/* Right Column: Questions */}
        <div className="h-fit space-y-4 bg-gray-50 rounded-xl shadow-md p-6 border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-4 text-lg">
            Questions {currentSection.questionCount || 0}
          </h4>
          
          {currentSection.questions && currentSection.questions.length > 0 ? (
            currentSection.questions.map((question, qIndex) => (
              <QuestionCard
                key={qIndex}
                question={question}
                index={qIndex + 1}
                onAnswerChange={(value) => handleAnswerChange(`${currentPassage}_${qIndex}`, value)}
                value={answers[`${currentPassage}_${qIndex}`]}
              />
            ))
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-blue-900 font-medium">
                📝 {currentSection.questionCount || 0} questions for this section
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Questions will be generated based on your test content
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Total Progress: {answeredCount} / {totalQuestions} answered
            </p>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg"
          >
            Submit Test ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingForm;
