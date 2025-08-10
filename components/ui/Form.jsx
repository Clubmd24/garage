import React from 'react';

// Form Group Component
const FormGroup = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-2 mb-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Form Label Component
const FormLabel = ({
  children,
  htmlFor,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-text-primary mb-2 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-error ml-1">*</span>}
    </label>
  );
};

// Form Input Component
const FormInput = ({
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  success = false,
  size = 'default',
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-3 bg-surface-primary border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary transition-all duration-200 backdrop-blur-sm';
  
  const stateClasses = {
    default: 'border-border-primary focus:border-primary focus:ring-primary',
    error: 'border-error focus:border-error focus:ring-error',
    success: 'border-success focus:border-success focus:ring-success'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    default: 'px-4 py-3',
    lg: 'px-6 py-4 text-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-border-accent/50 focus:transform focus:scale-[1.01] focus:shadow-lg';
  
  const classes = [
    baseClasses,
    stateClasses[error ? 'error' : success ? 'success' : 'default'],
    sizeClasses[size],
    disabledClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={classes}
      {...props}
    />
  );
};

// Form Textarea Component
const FormTextarea = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  success = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-3 bg-surface-primary border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary transition-all duration-200 backdrop-blur-sm resize-none';
  
  const stateClasses = {
    default: 'border-border-primary focus:border-primary focus:ring-primary',
    error: 'border-error focus:border-error focus:ring-error',
    success: 'border-success focus:border-success focus:ring-success'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-border-accent/50 focus:transform focus:scale-[1.01] focus:shadow-lg';
  
  const classes = [
    baseClasses,
    stateClasses[error ? 'error' : success ? 'success' : 'default'],
    disabledClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      rows={rows}
      className={classes}
      {...props}
    />
  );
};

// Form Select Component
const FormSelect = ({
  id,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  error = false,
  success = false,
  size = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-3 bg-surface-primary border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary transition-all duration-200 backdrop-blur-sm appearance-none bg-no-repeat bg-right';
  
  const stateClasses = {
    default: 'border-border-primary focus:border-primary focus:ring-primary',
    error: 'border-error focus:border-error focus:ring-error',
    success: 'border-success focus:border-success focus:ring-success'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    default: 'px-4 py-3',
    lg: 'px-6 py-4 text-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-border-accent/50 focus:transform focus:scale-[1.01] focus:shadow-lg';
  
  const classes = [
    baseClasses,
    stateClasses[error ? 'error' : success ? 'success' : 'default'],
    sizeClasses[size],
    disabledClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={classes}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1.5em 1.5em'
      }}
      {...props}
    >
      {children}
    </select>
  );
};

// Form Checkbox Component
const FormCheckbox = ({
  id,
  name,
  checked,
  onChange,
  required = false,
  disabled = false,
  error = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'w-4 h-4 text-primary bg-surface-primary border border-border-primary rounded focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-primary transition-all duration-200';
  
  const stateClasses = error ? 'border-error focus:ring-error' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const classes = [
    baseClasses,
    stateClasses,
    disabledClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={classes}
        {...props}
      />
      {children && (
        <label htmlFor={id} className="ml-2 text-sm text-text-primary cursor-pointer">
          {children}
        </label>
      )}
    </div>
  );
};

// Form Radio Component
const FormRadio = ({
  id,
  name,
  value,
  checked,
  onChange,
  required = false,
  disabled = false,
  error = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'w-4 h-4 text-primary bg-surface-primary border border-border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-primary transition-all duration-200';
  
  const stateClasses = error ? 'border-error focus:ring-error' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const classes = [
    baseClasses,
    stateClasses,
    disabledClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="flex items-center">
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={classes}
        {...props}
      />
      {children && (
        <label htmlFor={id} className="ml-2 text-sm text-text-primary cursor-pointer">
          {children}
        </label>
      )}
    </div>
  );
};

// Form Error Message Component
const FormErrorMessage = ({
  children,
  className = '',
  ...props
}) => {
  if (!children) return null;
  
  return (
    <p className={`text-sm text-error mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

// Form Success Message Component
const FormSuccessMessage = ({
  children,
  className = '',
  ...props
}) => {
  if (!children) return null;
  
  return (
    <p className={`text-sm text-success mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

// Form Help Text Component
const FormHelpText = ({
  children,
  className = '',
  ...props
}) => {
  if (!children) return null;
  
  return (
    <p className={`text-sm text-text-muted mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

// Form Field Component (Combines Label, Input, and Messages)
const FormField = ({
  label,
  htmlFor,
  required = false,
  error,
  success,
  helpText,
  children,
  className = '',
  ...props
}) => {
  return (
    <FormGroup className={className} {...props}>
      {label && (
        <FormLabel htmlFor={htmlFor} required={required}>
          {label}
        </FormLabel>
      )}
      
      {children}
      
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
      {success && <FormSuccessMessage>{success}</FormSuccessMessage>}
      {helpText && <FormHelpText>{helpText}</FormHelpText>}
    </FormGroup>
  );
};

export {
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadio,
  FormErrorMessage,
  FormSuccessMessage,
  FormHelpText,
  FormField
}; 