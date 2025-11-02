/**
 * QuestionCard Component
 * Displays individual questions with different types (MCQ, fill-in, TFNG, etc.)
 */

import React from 'react';

const QuestionCard = ({ question, index, onAnswerChange, value, disabled = false }) => {
  const handleAnswerChange = (answer) => {
    if (!disabled && onAnswerChange) {
      onAnswerChange(answer);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 hover:border-blue-300 transition-all duration-200">
      {/* Question Number & Type */}
      <div className="flex items-center justify-between mb-3">
        <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
          Q{index}
        </span>
        {question.type && (
          <span className="text-xs text-gray-500 font-medium uppercase">
            {question.type}
          </span>
        )}
      </div>

      {/* Question Text */}
      <p className="text-gray-900 font-medium mb-3 leading-relaxed">
        {question.question}
      </p>

      {/* Multiple Choice Options */}
      {question.options && question.options.length > 0 && (
        <div className="space-y-2">
          {question.options.map((option, optIndex) => (
            <label
              key={optIndex}
              className={`flex items-start space-x-3 cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                value === option
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-blue-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name={`question-${index}`}
                value={option}
                checked={value === option}
                onChange={() => handleAnswerChange(option)}
                disabled={disabled}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-800 flex-1">{option}</span>
            </label>
          ))}
        </div>
      )}

      {/* Text Input (Fill-in, Short Answer) */}
      {(!question.options || question.options.length === 0) && (
        <input
          type="text"
          placeholder="Type your answer here"
          value={value || ''}
          onChange={(e) => handleAnswerChange(e.target.value)}
          disabled={disabled}
          className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
            disabled 
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
              : 'bg-white border-gray-300 hover:border-blue-400'
          }`}
        />
      )}

      {/* True/False/Not Given Options */}
      {question.type === 'TrueFalseNotGiven' || question.type === 'TrueFalse' && (
        <div className="grid grid-cols-3 gap-2">
          {['True', 'False', 'Not Given'].map((option) => (
            <button
              key={option}
              onClick={() => handleAnswerChange(option)}
              disabled={disabled}
              className={`py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                value === option
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {question.hint && (
        <p className="text-xs text-gray-500 mt-2 italic">
          💡 {question.hint}
        </p>
      )}
    </div>
  );
};

export default QuestionCard;
