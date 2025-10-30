import React, { memo } from 'react';

const Loader = memo(() => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
});

Loader.displayName = 'Loader';

export default Loader;
