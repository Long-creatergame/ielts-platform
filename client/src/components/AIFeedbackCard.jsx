/**
 * AI Feedback Card Component
 * Displays AI-generated writing feedback with progress bars
 */

import React from 'react';

export default function AIFeedbackCard({ feedback }) {
  if (!feedback || feedback.error) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-gray-500 text-lg">
          {feedback?.error ? feedback.message : 'AI đang chấm bài, vui lòng đợi vài phút...'}
        </p>
      </div>
    );
  }

  const criteria = [
    { key: 'taskResponse', label: 'Task Response', color: 'blue' },
    { key: 'coherence', label: 'Coherence & Cohesion', color: 'green' },
    { key: 'lexical', label: 'Lexical Resource', color: 'purple' },
    { key: 'grammar', label: 'Grammar Range & Accuracy', color: 'orange' }
  ];

  const getColorClasses = (color, shade = 600) => ({
    bg: `bg-${color}-${shade}`,
    border: `border-${color}-200`,
    text: `text-${color}-900`,
    bgLight: `bg-${color}-50`,
    progressBg: `bg-${color}-200`,
    progressFill: `bg-${color}-${shade}`
  });

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-indigo-900">
            Overall Band Score
          </h3>
          <span className="text-5xl font-bold text-indigo-600">
            {feedback.overall || '-'}
          </span>
        </div>
        <div className="w-full bg-indigo-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((feedback.overall || 0) / 9) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Criteria Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteria.map((criterion) => {
          const colors = getColorClasses(criterion.color);
          const band = feedback[criterion.key]?.band || feedback[criterion.key];
          const comment = feedback[criterion.key]?.comment;
          
          return (
            <div key={criterion.key} className={`bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200`}>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-900 capitalize">
                  {criterion.label}
                </span>
                <span className={`text-3xl font-bold ${colors.text.replace('900', '600')}`}>
                  {band || '-'}
                </span>
              </div>
              
              {comment && (
                <div className="text-sm text-gray-600 mb-3 min-h-[3rem]">
                  {comment}
                </div>
              )}
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${colors.progressFill} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${((band || 0) / 9) * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* General Feedback */}
      {feedback.feedback && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
          <h4 className="font-bold text-blue-900 mb-2 flex items-center">
            <span className="text-xl mr-2">📝</span>
            Detailed Feedback
          </h4>
          <p className="text-blue-800 leading-relaxed">{feedback.feedback}</p>
        </div>
      )}
      
      {/* Strengths & Improvements */}
      {(feedback.strengths || feedback.improvements) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-bold text-green-900 mb-3 flex items-center">
                <span className="text-xl mr-2">✅</span>
                Strengths
              </h4>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="text-green-800 flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {feedback.improvements && feedback.improvements.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h4 className="font-bold text-orange-900 mb-3 flex items-center">
                <span className="text-xl mr-2">💡</span>
                Areas to Improve
              </h4>
              <ul className="space-y-2">
                {feedback.improvements.map((improvement, index) => (
                  <li key={index} className="text-orange-800 flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
