import React from 'react';

export default function LoadingScreen({ message = 'Loading test data...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
      <p className="text-gray-600 text-lg">{message}</p>
      <p className="text-gray-400 text-sm mt-2">Please wait...</p>
    </div>
  );
}

