import React from 'react';

export const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'card-modern backdrop-blur-xl border border-blue-500/10 rounded-2xl shadow-2xl transition-all duration-300';
  
  const variants = {
    default: 'bg-gradient-to-br from-gray-900/90 to-gray-800/90',
    stats: 'bg-gradient-to-br from-emerald-500/10 to-emerald-400/10 border-l-4 border-l-emerald-500',
    warning: 'bg-gradient-to-br from-amber-500/10 to-amber-400/10 border-l-4 border-l-amber-500',
    danger: 'bg-gradient-to-br from-red-500/10 to-red-400/10 border-l-4 border-l-red-500',
    info: 'bg-gradient-to-br from-blue-500/10 to-blue-400/10 border-l-4 border-l-blue-500'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
