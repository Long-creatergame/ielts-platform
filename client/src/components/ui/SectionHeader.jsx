import React from 'react';

export default function SectionHeader({ title, subtitle, className = '' }) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
  );
}

import React from 'react';

export default function SectionHeader({ title, subtitle, icon = null, className = '' }) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
        <span className="text-blue-600 text-xl">{icon || '🎯'}</span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
}


