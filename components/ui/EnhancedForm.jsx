import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

// Enhanced Input Component
const EnhancedInput = React.forwardRef(({
  label,
  error,
  success,
  warning,
  info,
  leftIcon,
  rightIcon,
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const inputRef = useRef(null);
  const combinedRef = (node) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    if (inputRef.current) {
      setHasValue(!!inputRef.current.value);
    }
  }, []);

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const baseClasses = 'input-modern w-full transition-all duration-300';
  
  const variantClasses = {
    default: 'border-border-primary focus:border-border-accent',
    error: 'border-error focus:border-error',
    success: 'border-success focus:border-success',
    warning: 'border-warning focus:border-warning',
    info: 'border-info focus:border-info'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const stateClasses = error ? variantClasses.error :
                     success ? variantClasses.success :
                     warning ? variantClasses.warning :
                     info ? variantClasses.info :
                     variantClasses.default;

  const focusClasses = isFocused ? 'ring-2 ring-border-accent/20 shadow-lg' : '';
  const hasValueClasses = hasValue ? 'bg-surface-elevated' : '';

  const classes = cn(
    baseClasses,
    sizeClasses[size],
    stateClasses,
    focusClasses,
    hasValueClasses,
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={combinedRef}
          className={cn(
            classes,
            leftIcon && 'pl-10',
            rightIcon && 'pr-10'
          )}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-error flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}
      
      {success && (
        <p className="text-sm text-success flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{success}</span>
        </p>
      )}
      
      {warning && (
        <p className="text-sm text-warning flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{warning}</span>
        </p>
      )}
      
      {info && (
        <p className="text-sm text-info flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{info}</span>
        </p>
      )}
    </div>
  );
});

// Enhanced Select Component
const EnhancedSelect = React.forwardRef(({
  label,
  options = [],
  error,
  success,
  warning,
  info,
  placeholder = 'Select an option',
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const baseClasses = 'select-modern w-full transition-all duration-300 cursor-pointer';
  
  const variantClasses = {
    default: 'border-border-primary focus:border-border-accent',
    error: 'border-error focus:border-error',
    success: 'border-success focus:border-success',
    warning: 'border-warning focus:border-warning',
    info: 'border-info focus:border-info'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const stateClasses = error ? variantClasses.error :
                     success ? variantClasses.success :
                     warning ? variantClasses.warning :
                     info ? variantClasses.info :
                     variantClasses.default;

  const classes = cn(
    baseClasses,
    sizeClasses[size],
    stateClasses,
    className
  );

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    setSearchTerm('');
    if (props.onChange) {
      const event = { target: { value: option.value } };
      props.onChange(event);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div
          className={classes}
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          <span className={selectedOption ? 'text-text-primary' : 'text-text-tertiary'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg 
            className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-surface-elevated border border-border-primary rounded-lg shadow-xl max-h-60 overflow-auto">
            <div className="p-2 border-b border-border-primary">
              <input
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-surface-primary border border-border-primary rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:border-border-accent"
                autoFocus
              />
            </div>
            
            <div className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className="px-3 py-2 hover:bg-surface-secondary cursor-pointer transition-colors"
                    onClick={() => handleSelect(option)}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-text-tertiary text-center">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-error flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});

// Enhanced Textarea Component
const EnhancedTextarea = React.forwardRef(({
  label,
  error,
  success,
  warning,
  info,
  className = '',
  variant = 'default',
  size = 'md',
  rows = 4,
  maxLength,
  showCharacterCount = false,
  ...props
}, ref) => {
  const [charCount, setCharCount] = useState(0);

  const baseClasses = 'textarea-modern w-full transition-all duration-300 resize-vertical';
  
  const variantClasses = {
    default: 'border-border-primary focus:border-border-accent',
    error: 'border-error focus:border-error',
    success: 'border-success focus:border-success',
    warning: 'border-warning focus:border-warning',
    info: 'border-info focus:border-info'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const stateClasses = error ? variantClasses.error :
                     success ? variantClasses.success :
                     warning ? variantClasses.warning :
                     info ? variantClasses.info :
                     variantClasses.default;

  const classes = cn(
    baseClasses,
    sizeClasses[size],
    stateClasses,
    className
  );

  const handleChange = (e) => {
    setCharCount(e.target.value.length);
    props.onChange?.(e);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={classes}
        rows={rows}
        maxLength={maxLength}
        onChange={handleChange}
        {...props}
      />
      
      <div className="flex items-center justify-between">
        {error && (
          <p className="text-sm text-error flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}
        
        {showCharacterCount && maxLength && (
          <p className="text-sm text-text-tertiary ml-auto">
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

// Multi-Step Form Component
const MultiStepForm = ({
  steps = [],
  currentStep = 0,
  onStepChange,
  onSubmit,
  className = '',
  showProgress = true,
  showStepNumbers = true,
  allowStepNavigation = true
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange?.(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange?.(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit?.(formData);
  };

  const updateFormData = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Navigation */}
      {showStepNumbers && (
        <div className="flex items-center justify-center space-x-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center space-x-2',
                index <= currentStep ? 'text-primary' : 'text-text-tertiary'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all',
                index < currentStep ? 'bg-primary border-primary text-white' :
                index === currentStep ? 'border-primary text-primary' :
                'border-border-primary text-text-tertiary'
              )}>
                {index < currentStep ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {step.title && (
                <span className="hidden sm:block text-sm font-medium">
                  {step.title}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Current Step Content */}
      <div className="space-y-6">
        {currentStepData?.title && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary">
              {currentStepData.title}
            </h2>
            {currentStepData.description && (
              <p className="text-text-secondary mt-2">
                {currentStepData.description}
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {currentStepData?.component && (
            <currentStepData.component
              data={formData}
              errors={errors}
              onChange={updateFormData}
              onError={setErrors}
            />
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-border-primary">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={!allowStepNavigation || isFirstStep}
          className="min-w-[100px]"
        >
          Previous
        </Button>

        <div className="flex items-center space-x-3">
          {!isLastStep ? (
            <Button
              onClick={handleNext}
              className="min-w-[100px]"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="min-w-[100px]"
            >
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Form Field Group Component
const FormFieldGroup = ({
  title,
  description,
  children,
  className = '',
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={cn('space-y-4 p-6 bg-surface-secondary rounded-lg border border-border-primary', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-text-primary">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-text-secondary">
              {description}
            </p>
          )}
        </div>
        
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            <svg 
              className={cn(
                'w-4 h-4 transition-transform',
                isCollapsed ? 'rotate-90' : ''
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Form Validation Component
const FormValidation = ({
  errors = {},
  touched = {},
  className = ''
}) => {
  const hasErrors = Object.keys(errors).length > 0;
  
  if (!hasErrors) return null;

  return (
    <div className={cn('space-y-2 p-4 bg-error/10 border border-error/20 rounded-lg', className)}>
      <h4 className="text-sm font-medium text-error flex items-center space-x-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>Please fix the following errors:</span>
      </h4>
      
      <ul className="space-y-1 text-sm text-error">
        {Object.entries(errors).map(([field, error]) => (
          <li key={field} className="flex items-start space-x-2">
            <span className="text-error">•</span>
            <span>
              <strong className="capitalize">{field.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> {error}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

EnhancedInput.displayName = 'EnhancedInput';
EnhancedSelect.displayName = 'EnhancedSelect';
EnhancedTextarea.displayName = 'EnhancedTextarea';
MultiStepForm.displayName = 'MultiStepForm';
FormFieldGroup.displayName = 'FormFieldGroup';
FormValidation.displayName = 'FormValidation';

export {
  EnhancedInput,
  EnhancedSelect,
  EnhancedTextarea,
  MultiStepForm,
  FormFieldGroup,
  FormValidation
};

export default EnhancedInput; 