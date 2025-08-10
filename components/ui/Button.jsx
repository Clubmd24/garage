import React from 'react';
import { cn } from '@/lib/utils';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'btn-modern transition-modern focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary';
  
  const variantClasses = {
    primary: 'btn-modern',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    danger: 'btn-danger',
    success: 'btn-success',
    ghost: 'bg-transparent border border-border-primary text-text-primary hover:bg-surface-secondary hover:border-border-accent'
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: '', // Default size
    lg: 'btn-lg'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:transform hover:translateY(-2px) hover:shadow-lg';
  const loadingClasses = loading ? 'cursor-wait' : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    loadingClasses,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    const iconClasses = 'inline-flex items-center';
    const iconElement = React.cloneElement(icon, {
      className: `${iconClasses} ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`
    });

    return iconElement;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="loading-pulse w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </>
      );
    }

    if (icon && iconPosition === 'left') {
      return (
        <>
          {renderIcon()}
          {children}
        </>
      );
    }

    if (icon && iconPosition === 'right') {
      return (
        <>
          {children}
          {renderIcon()}
        </>
      );
    }

    return children;
  };

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;

// Specialized button components for common use cases
export function IconButton({ 
  icon, 
  variant = 'ghost', 
  size = 'md', 
  className = '', 
  ...props 
}) {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
    xl: 'p-5',
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(sizeClasses[size] || sizeClasses.md, '!px-0 !py-0', className)}
      {...props}
    >
      {icon}
    </Button>
  );
}

export function ActionButton({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) {
  return (
    <Button
      variant={variant}
      size="md"
      className={cn('font-semibold shadow-lg', className)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function FloatingButton({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) {
  return (
    <Button
      variant={variant}
      size="lg"
      className={cn(
        'fixed bottom-6 right-6 rounded-full shadow-2xl z-50',
        'hover:scale-110 transition-transform duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
