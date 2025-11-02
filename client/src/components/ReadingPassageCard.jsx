/**
 * ReadingPassageCard Component
 * Displays reading passage with paragraph numbering and Cambridge-like styling
 */

import React from 'react';

const ReadingPassageCard = ({ passage, title, instructions }) => {
  if (!passage) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">Reading passage content will be loaded here</p>
        <p className="text-sm text-gray-400 mt-2">Content is generated dynamically based on your level</p>
      </div>
    );
  }

  // Split passage into paragraphs
  const paragraphs = passage.trim().split(/\n\n+/).filter(p => p.trim().length > 0);

  return (
    <div className="space-y-4">
      {/* Title & Instructions */}
      {title && (
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-lg mb-6">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">{title}</h3>
          {instructions && (
            <p className="text-sm text-indigo-700">{instructions}</p>
          )}
        </div>
      )}

      {/* Reading Passage */}
      <div className="prose prose-lg max-w-none">
        {paragraphs.map((paragraph, index) => (
          <div 
            key={index} 
            className="mb-4 text-gray-800 leading-relaxed"
          >
            <span className="inline-block bg-indigo-100 text-indigo-700 font-bold text-xs px-2 py-1 rounded mr-2 align-top">
              {index + 1}
            </span>
            <span className="text-base">{paragraph.trim()}</span>
          </div>
        ))}
      </div>

      {/* Cambridge Footer Note */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <p className="text-xs text-gray-500 italic">
          © This passage is formatted in Cambridge IELTS style. Read carefully and answer the questions on the right.
        </p>
      </div>
    </div>
  );
};

export default ReadingPassageCard;
