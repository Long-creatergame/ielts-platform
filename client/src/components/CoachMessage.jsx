import React from 'react';

export default function CoachMessage({ message, type = 'info' }) {
  const getMessageStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '🎉';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '💡';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getMessageStyles(type)}`}>
      <div className="flex items-start">
        <span className="text-2xl mr-3">{getIcon(type)}</span>
        <div>
          <h3 className="font-semibold mb-1">Coach Message</h3>
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}
