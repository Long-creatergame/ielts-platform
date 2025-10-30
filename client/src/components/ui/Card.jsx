import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

import React from 'react';

export default function Card({ className = '', children, ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}


