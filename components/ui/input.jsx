import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({ 
  className, 
  type = 'text',
  size = 'md',
  variant = 'default',
  error,
  success,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  label,
  helperText,
  ...props 
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const variantClasses = {
    default: 'bg-input-bg border-input-border focus:border-input-focus focus:ring-input-focus',
    error: 'bg-red-50 border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'bg-green-50 border-green-300 focus:border-green-500 focus:ring-green-500',
    ghost: 'bg-transparent border-transparent hover:bg-surface-secondary',
  };

  const getVariantClass = () => {
    if (error) return variantClasses.error;
    if (success) return variantClasses.success;
    return variantClasses[variant] || variantClasses.default;
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          className={cn(
            'input w-full transition-all duration-200',
            sizeClasses[size] || sizeClasses.md,
            getVariantClass(),
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            error && 'border-red-500 focus:ring-red-500',
            success && 'border-green-500 focus:ring-green-500',
            disabled && 'opacity-50 cursor-not-allowed bg-surface-secondary',
            loading && 'opacity-75',
            className
          )}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg 
              className="animate-spin h-4 w-4 text-text-muted" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>
      
      {helperText && (
        <p className={cn(
          'text-sm',
          error ? 'text-red-600' : success ? 'text-green-600' : 'text-text-muted'
        )}>
          {helperText}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {success && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Specialized input components
export function SearchInput({ className, ...props }) {
  return (
    <Input
      type="search"
      placeholder="Search..."
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      className={cn('max-w-md', className)}
      {...props}
    />
  );
}

export function EmailInput({ className, ...props }) {
  return (
    <Input
      type="email"
      placeholder="Enter your email"
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m6.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      }
      className={className}
      {...props}
    />
  );
}

export function PasswordInput({ className, showToggle = true, ...props }) {
  const [showPassword, setShowPassword] = React.useState(false);
  
  return (
    <Input
      type={showPassword ? 'text' : 'password'}
      placeholder="Enter your password"
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      }
      iconPosition="right"
      icon={
        showToggle ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        ) : undefined
      }
      className={className}
      {...props}
    />
  );
}

export default Input;
