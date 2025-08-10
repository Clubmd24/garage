import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'btn-modern transition-modern font-semibold rounded-xl';
  
  const variants = {
    primary: 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500/20 text-white hover:from-blue-700 hover:to-blue-800',
    secondary: 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-blue-500/20 text-gray-300 hover:from-gray-700/90 hover:to-gray-800/90',
    success: 'bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500/20 text-white hover:from-emerald-700 hover:to-emerald-800',
    warning: 'bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500/20 text-white hover:from-amber-700 hover:to-amber-800',
    danger: 'bg-gradient-to-br from-red-600 to-red-700 border-red-500/20 text-white hover:from-red-700 hover:to-red-800',
    ghost: 'bg-transparent border-blue-500/20 text-blue-400 hover:bg-blue-500/10'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
