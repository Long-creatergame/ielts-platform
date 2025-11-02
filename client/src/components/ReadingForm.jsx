/**
 * Reading Form Component
 * Renders IELTS Reading test with passages and questions based on blueprint
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ReadingForm = ({ blueprint, mode, onSubmit, onTimeUp }) => {
  const [answers, setAnswers] = useState({});
  const [currentPassage, setCurrentPassage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(blueprint?.timeLimit ? blueprint.timeLimit * 60 : 60 * 60);

  const sections = blueprint?.sections || [];
  const totalQuestions = blueprint?.totalQuestions || 40;

  useEffect(() => {
    if (timeLeft === 0 && onTimeUp) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const getTimerColor = () => {
    const minutesLeft = Math.floor(timeLeft / 60);
    if (minutesLeft > 40) return 'bg-green-500';
    if (minutesLeft > 20) return 'bg-yellow-500';
    if (minutesLeft > 10) return 'bg-orange-500';
    return 'bg-red-500';
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            📖 IELTS Reading Test - {mode === 'academic' ? 'Academic' : 'General Training'}
          </h2>
          <div className="flex items-center space-x-4">
            <div className={`${getTimerColor()} text-white px-4 py-2 rounded-lg font-bold text-lg`}>
              ⏰ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
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
        <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
          <div 
            className={`${getTimerColor()} h-3 rounded-full transition-all duration-500`}
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

      {/* Current Section */}
      <motion.div
        key={currentPassage}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-bold text-blue-900 mb-2">
            {currentSection.title || `Passage ${currentPassage + 1}`}
          </h3>
          {currentSection.description && (
            <p className="text-gray-700 text-sm">{currentSection.description}</p>
          )}
        </div>

        {/* Reading Passage */}
        <div className="p-6 max-h-96 overflow-y-auto border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Reading Passage:</h4>
          {currentSection.passage ? (
            <div className="prose max-w-none whitespace-pre-line leading-relaxed text-gray-800">
              {currentSection.passage}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-500">Reading passage content will be loaded here</p>
              <p className="text-sm text-gray-400 mt-2">Content is generated dynamically based on your level</p>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="p-6 space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Questions {currentSection.questionCount || 0}:</h4>
          
          {currentSection.questions && currentSection.questions.length > 0 ? (
            currentSection.questions.map((question, qIndex) => (
              <div key={qIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="font-medium text-gray-900 mb-2">
                  Question {qIndex + 1}:
                  <span className="ml-2 text-base font-normal">{question.question}</span>
                </p>
                
                {question.options && question.options.length > 0 ? (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-start space-x-3 cursor-pointer hover:bg-blue-50 p-2 rounded-lg">
                        <input
                          type="radio"
                          name={`section_${currentPassage}_q${qIndex}`}
                          value={option}
                          checked={answers[`${currentPassage}_${qIndex}`] === option}
                          onChange={() => handleAnswerChange(`${currentPassage}_${qIndex}`, option)}
                          className="mt-1"
                        />
                        <span className="text-gray-800">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Type your answer here"
                    value={answers[`${currentPassage}_${qIndex}`] || ''}
                    onChange={(e) => handleAnswerChange(`${currentPassage}_${qIndex}`, e.target.value)}
                    className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
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
      </motion.div>

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
