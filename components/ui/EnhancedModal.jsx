import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from './Button';

// Modal Backdrop Component
const ModalBackdrop = React.forwardRef(({
  children,
  isOpen,
  onClose,
  backdropBlur = true,
  className = '',
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 200);
      // Restore body scroll
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      // Cleanup body scroll on unmount
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'modal-backdrop',
        'fixed inset-0 z-50 flex items-center justify-center',
        'transition-all duration-200 ease-out',
        isAnimating ? 'opacity-100' : 'opacity-0',
        className
      )}
      onClick={onClose}
      {...props}
    >
      <div
        className={cn(
          'absolute inset-0',
          backdropBlur ? 'backdrop-blur-sm' : '',
          'bg-black/50'
        )}
      />
      {children}
    </div>
  );
});

// Modal Content Component
const ModalContent = React.forwardRef(({
  children,
  isOpen,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
    custom: ''
  };

  return (
    <div
      ref={ref}
      className={cn(
        'modal-content',
        'relative w-full mx-4 transform transition-all duration-200 ease-out',
        sizeClasses[size],
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
});

// Modal Header Component
const ModalHeader = React.forwardRef(({
  children,
  onClose,
  showCloseButton = true,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'modal-header',
        'flex items-center justify-between p-6 pb-4',
        'border-b border-border-primary',
        className
      )}
      {...props}
    >
      <div className="flex-1">
        {children}
      </div>
      
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className={cn(
            'modal-close-button',
            'p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'text-text-tertiary hover:text-text-primary'
          )}
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
});

// Modal Body Component
const ModalBody = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'modal-body',
        'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

// Modal Footer Component
const ModalFooter = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'modal-footer',
        'flex items-center justify-end space-x-3 p-6 pt-4',
        'border-t border-border-primary',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

// Enhanced Modal Component
const EnhancedModal = React.forwardRef(({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showBackdrop = true,
  backdropBlur = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  preventClose = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  ...props
}, ref) => {
  const modalRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape && !preventClose) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, preventClose, onClose]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!preventClose) {
      onClose?.();
    }
  }, [preventClose, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdropClick && !preventClose) {
      onClose?.();
    }
  }, [closeOnBackdropClick, preventClose, onClose]);

  const variantClasses = {
    default: 'bg-surface-primary border border-border-primary shadow-2xl',
    elevated: 'bg-surface-elevated border border-border-primary shadow-2xl',
    minimal: 'bg-surface-primary border border-border-primary shadow-lg',
    fullscreen: 'bg-surface-primary min-h-screen'
  };

  if (!isOpen) return null;

  const modalContent = (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={handleBackdropClick}
      backdropBlur={backdropBlur}
      showBackdrop={showBackdrop}
    >
      <ModalContent
        ref={modalRef}
        isOpen={isOpen}
        size={size}
        className={cn(
          'modal',
          variantClasses[variant],
          'rounded-lg overflow-hidden',
          className
        )}
        {...props}
      >
        {/* Header */}
        {title && (
          <ModalHeader
            onClose={handleClose}
            showCloseButton={!preventClose}
            className={headerClassName}
          >
            <h2 className="text-xl font-semibold text-text-primary">
              {title}
            </h2>
          </ModalHeader>
        )}

        {/* Body */}
        <ModalBody className={bodyClassName}>
          {children}
        </ModalBody>
      </ModalContent>
    </ModalBackdrop>
  );

  // Render to portal if available
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
});

// Confirmation Modal Component
const ConfirmationModal = React.forwardRef(({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  const variantClasses = {
    default: 'text-primary',
    danger: 'text-error',
    warning: 'text-warning',
    success: 'text-success'
  };

  return (
    <EnhancedModal
      ref={ref}
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      variant="default"
      className={className}
      {...props}
    >
      <div className="space-y-4">
        <p className="text-text-secondary">
          {message}
        </p>
        
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            className={variantClasses[variant]}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </div>
    </EnhancedModal>
  );
});

// Alert Modal Component
const AlertModal = React.forwardRef(({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  actionText = 'OK',
  onAction,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const handleAction = () => {
    onAction?.();
    onClose?.();
  };

  const typeClasses = {
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error'
  };

  const typeIcons = {
    info: (
      <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <EnhancedModal
      ref={ref}
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      variant="default"
      className={className}
      {...props}
    >
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {typeIcons[type]}
          </div>
          <div className="flex-1">
            <p className="text-text-secondary">
              {message}
            </p>
          </div>
        </div>
        
        <ModalFooter>
          <Button
            variant="default"
            onClick={handleAction}
            className={typeClasses[type]}
          >
            {actionText}
          </Button>
        </ModalFooter>
      </div>
    </EnhancedModal>
  );
});

// Loading Modal Component
const LoadingModal = React.forwardRef(({
  isOpen,
  onClose,
  title = 'Loading...',
  message = 'Please wait while we process your request.',
  showCloseButton = false,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  return (
    <EnhancedModal
      ref={ref}
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      variant="default"
      showBackdrop={true}
      closeOnBackdropClick={false}
      closeOnEscape={false}
      preventClose={true}
      className={className}
      {...props}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        
        <p className="text-center text-text-secondary">
          {message}
        </p>
        
        {showCloseButton && onClose && (
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
          </ModalFooter>
        )}
      </div>
    </EnhancedModal>
  );
});

ModalBackdrop.displayName = 'ModalBackdrop';
ModalContent.displayName = 'ModalContent';
ModalHeader.displayName = 'ModalHeader';
ModalBody.displayName = 'ModalBody';
ModalFooter.displayName = 'ModalFooter';
EnhancedModal.displayName = 'EnhancedModal';
ConfirmationModal.displayName = 'ConfirmationModal';
AlertModal.displayName = 'AlertModal';
LoadingModal.displayName = 'LoadingModal';

export {
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  EnhancedModal,
  ConfirmationModal,
  AlertModal,
  LoadingModal
};

export default EnhancedModal; 