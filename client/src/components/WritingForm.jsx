/**
 * Writing Form Component
 * Renders IELTS Writing test with Task 1 and Task 2 based on blueprint
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountdownTimer from './CountdownTimer';

const WritingForm = ({ blueprint, mode, onSubmit, onTimeUp }) => {
  const [task1Answer, setTask1Answer] = useState('');
  const [task2Answer, setTask2Answer] = useState('');
  const [timeLeft, setTimeLeft] = useState(blueprint?.timeLimit ? blueprint.timeLimit * 60 : 60 * 60);
  const [currentTask, setCurrentTask] = useState(0); // 0 = Task 1, 1 = Task 2

  const tasks = blueprint?.tasks || [];

  const handleTimeTick = (newTime) => {
    setTimeLeft(newTime);
  };

  const handleTimeComplete = () => {
    if (onTimeUp) onTimeUp();
  };

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const getTaskWordCount = (taskNumber) => {
    if (taskNumber === 0) return countWords(task1Answer);
    if (taskNumber === 1) return countWords(task2Answer);
    return 0;
  };

  const handleSubmit = () => {
    if (!onSubmit) return;
    
    const submission = {
      skill: 'writing',
      mode,
      answers: {
        task1: task1Answer,
        task2: task2Answer
      },
      wordCounts: {
        task1: countWords(task1Answer),
        task2: countWords(task2Answer)
      },
      timeSpent: blueprint?.timeLimit ? blueprint.timeLimit * 60 - timeLeft : 0
    };
    
    onSubmit(submission);
  };

  if (!blueprint || !tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-red-600">No blueprint data available</p>
      </div>
    );
  }

  const currentTaskData = tasks[currentTask];
  const wordCount = getTaskWordCount(currentTask);
  const minWords = currentTaskData?.minWords || 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Timer & Progress */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-lg p-4 md:p-6 border border-indigo-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              ✍️ IELTS Writing Test
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              {mode === 'academic' ? 'Academic' : 'General Training'}
            </p>
          </div>
          <div className="flex items-center justify-center sm:justify-end">
            <CountdownTimer 
              duration={blueprint?.timeLimit ? blueprint.timeLimit * 60 : 60 * 60}
              onTick={handleTimeTick}
              onComplete={handleTimeComplete}
              className="w-20 h-20 md:w-24 md:h-24"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 md:h-2.5 mb-3 md:mb-4">
          <div 
            className="bg-indigo-600 h-2 md:h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${(currentTask / (tasks.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Task Navigation */}
        <div className="flex gap-2">
          {tasks.map((task, index) => (
            <button
              key={index}
              onClick={() => setCurrentTask(index)}
              className={`flex-1 py-2 px-3 md:px-4 rounded-lg font-semibold transition-all duration-200 text-xs md:text-sm ${
                currentTask === index
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              {task.title || `Task ${task.taskNumber || index + 1}`}
            </button>
          ))}
        </div>
      </div>

      {/* Current Task */}
      <motion.div
        key={currentTask}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-4 md:p-8 border border-gray-200"
      >
        {/* Task Header */}
        <div className="mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-2">
            {currentTaskData.title || `Task ${currentTaskData.taskNumber || currentTask + 1}`}
          </h3>
          {currentTaskData.description && (
            <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
              {currentTaskData.description}
            </p>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
            <p className="text-sm md:text-base text-gray-800 whitespace-pre-line leading-relaxed">
              {currentTaskData.instruction}
            </p>
          </div>
        </div>

        {/* Word Count & Warnings */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 md:mb-4 gap-2">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className={`px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm ${
              wordCount >= minWords
                ? 'bg-green-100 text-green-800'
                : wordCount >= minWords * 0.9
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              Words: {wordCount} / {minWords}
            </div>
            {currentTask === 0 && (
              <div className="text-xs md:text-sm text-gray-600 bg-gray-50 px-2 md:px-3 py-1 rounded-full">
                ⏱️ {currentTaskData.timeLimit || 20} min
              </div>
            )}
            {currentTask === 1 && (
              <div className="text-xs md:text-sm text-gray-600 bg-gray-50 px-2 md:px-3 py-1 rounded-full">
                ⏱️ {currentTaskData.timeLimit || 40} min
              </div>
            )}
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={currentTask === 0 ? task1Answer : task2Answer}
          onChange={(e) => {
            if (currentTask === 0) {
              setTask1Answer(e.target.value);
            } else {
              setTask2Answer(e.target.value);
            }
          }}
          rows={currentTask === 0 ? 12 : 15}
          placeholder={`Write your answer here... (Minimum ${minWords} words)`}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-base leading-relaxed"
        />

        {/* Word Count Warning */}
        {wordCount > 0 && wordCount < minWords && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ {currentTaskData.wordCountWarning || `You need at least ${minWords} words.`}
            </p>
          </div>
        )}

        {/* Task Navigation */}
        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between gap-3">
          <button
            onClick={() => setCurrentTask(Math.max(0, currentTask - 1))}
            disabled={currentTask === 0}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 min-h-[44px] w-full sm:w-auto ${
              currentTask === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Previous Task
          </button>

          {currentTask < tasks.length - 1 ? (
            <button
              onClick={() => setCurrentTask(Math.min(tasks.length - 1, currentTask + 1))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 min-h-[44px] w-full sm:w-auto"
            >
              Next Task →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={countWords(task1Answer) < tasks[0].minWords || countWords(task2Answer) < tasks[1].minWords}
              className={`px-8 py-3 rounded-lg font-bold transition-all duration-200 min-h-[44px] w-full sm:w-auto ${
                countWords(task1Answer) >= tasks[0].minWords && countWords(task2Answer) >= tasks[1].minWords
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Test ✓
            </button>
          )}
        </div>
      </motion.div>

      {/* Task Summary */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Task Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          {tasks.map((task, index) => (
            <div key={index} className={`p-4 rounded-lg ${
              getTaskWordCount(index) >= task.minWords
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">
                  {task.title || `Task ${task.taskNumber || index + 1}`}
                </span>
                {getTaskWordCount(index) >= task.minWords && (
                  <span className="text-green-600 font-bold">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {getTaskWordCount(index)} / {task.minWords} words
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WritingForm;
