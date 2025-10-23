import React from 'react';

const ModernTestCard = ({ test, onStart }) => {
  const getSkillColor = (skill) => {
    const colors = {
      reading: 'blue',
      listening: 'green', 
      writing: 'purple',
      speaking: 'orange'
    };
    return colors[skill] || 'gray';
  };

  const getSkillIcon = (skill) => {
    const icons = {
      reading: '📖',
      listening: '🎧',
      writing: '✍️',
      speaking: '🗣️'
    };
    return icons[skill] || '📝';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            getSkillColor(test.skill) === 'blue' ? 'bg-blue-50' :
            getSkillColor(test.skill) === 'green' ? 'bg-green-50' :
            getSkillColor(test.skill) === 'purple' ? 'bg-purple-50' :
            getSkillColor(test.skill) === 'orange' ? 'bg-orange-50' :
            'bg-gray-50'
          }`}>
            <span className="text-lg">{getSkillIcon(test.skill)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">{test.skill} Test</h3>
            <p className="text-sm text-gray-500">{test.level} Level</p>
          </div>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {test.duration || '60 min'}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">{test.description}</p>
        {test.score && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Last Score:</span>
            <span className="font-semibold text-gray-900">{test.score}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onStart(test)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
      >
        {test.completed ? 'Retake Test' : 'Start Test'}
      </button>
    </div>
  );
};

export default ModernTestCard;
