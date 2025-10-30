import React from 'react';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

import React from 'react';

const variants = {
  primary: 'btn-primary px-4 py-2',
  secondary: 'btn-secondary px-4 py-2',
  danger: 'btn-danger px-4 py-2',
  link: 'text-blue-600 hover:text-blue-800 font-medium',
};

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  const cls = `${variants[variant] || variants.primary} ${className}`.trim();
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}


