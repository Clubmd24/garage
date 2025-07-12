import React from 'react';

export function Button({ type = 'button', className = '', children, ...props }) {
  return (
    <button type={type} className={`button px-4 ${className}`} {...props}>
      {children}
    </button>
  );
}
