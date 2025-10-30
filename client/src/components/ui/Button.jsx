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
