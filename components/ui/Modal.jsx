import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// Modal Overlay Component
const ModalOverlay = React.forwardRef(({
  children,
  isOpen,
  onClose,
  className = '',
  backdrop = true,
  backdropBlur = true,
  ...props
}, ref) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={ref}
      className={cn(
        'modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4',
        backdrop && 'bg-black/50',
        backdropBlur && 'backdrop-blur-sm',
        className
      )}
      onClick={handleBackdropClick}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
});

// Modal Content Component
const ModalContent = React.forwardRef(({
  children,
  className = '',
  size = 'md',
  centered = true,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'modal-content bg-surface-primary border border-border-primary rounded-xl shadow-2xl',
        'w-full max-h-[90vh] overflow-y-auto',
        sizeClasses[size],
        centered && 'mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

// Modal Header Component
const ModalHeader = React.forwardRef(({
  children,
  className = '',
  showClose = true,
  onClose,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('modal-header flex items-center justify-between p-6 pb-4', className)}
      {...props}
    >
      <div className="flex-1">
        {children}
      </div>
      
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="modal-close p-2 rounded-lg hover:bg-surface-secondary transition-colors text-text-tertiary hover:text-text-primary"
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

// Modal Title Component
const ModalTitle = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <h2
      ref={ref}
      className={cn('modal-title text-xl font-semibold text-text-primary', className)}
      {...props}
    >
      {children}
    </h2>
  );
});

// Modal Description Component
const ModalDescription = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <p
      ref={ref}
      className={cn('modal-description text-sm text-text-secondary mt-1', className)}
      {...props}
    >
      {children}
    </p>
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
      className={cn('modal-body px-6 py-4', className)}
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
      className={cn('modal-footer flex items-center justify-end space-x-3 p-6 pt-4 border-t border-border-primary', className)}
      {...props}
    >
      {children}
    </div>
  );
});

// Main Modal Component
const Modal = React.forwardRef(({
  isOpen,
  onClose,
  children,
  className = '',
  size = 'md',
  backdrop = true,
  backdropBlur = true,
  ...props
}, ref) => {
  return (
    <ModalOverlay
      ref={ref}
      isOpen={isOpen}
      onClose={onClose}
      backdrop={backdrop}
      backdropBlur={backdropBlur}
      className={className}
      {...props}
    >
      <ModalContent size={size}>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
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
  variant = 'default', // 'default', 'danger', 'warning'
  className = '',
  ...props
}, ref) => {
  const variantClasses = {
    default: 'bg-primary hover:bg-primary-dark',
    danger: 'bg-error hover:bg-error-dark',
    warning: 'bg-warning hover:bg-warning-dark'
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  return (
    <Modal
      ref={ref}
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className={className}
      {...props}
    >
      <ModalHeader onClose={onClose}>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      
      <ModalBody>
        <p className="text-text-secondary">{message}</p>
      </ModalBody>
      
      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className={cn(
            'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
            variantClasses[variant]
          )}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
});

// Alert Modal Component
const AlertModal = React.forwardRef(({
  isOpen,
  onClose,
  title,
  message,
  type = 'info', // 'info', 'success', 'warning', 'error'
  showIcon = true,
  className = '',
  ...props
}, ref) => {
  const typeConfig = {
    info: {
      icon: (
        <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-info/10',
      borderColor: 'border-info/20',
      textColor: 'text-info'
    },
    success: {
      icon: (
        <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      textColor: 'text-success'
    },
    warning: {
      icon: (
        <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      textColor: 'text-warning'
    },
    error: {
      icon: (
        <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-error/10',
      borderColor: 'border-error/20',
      textColor: 'text-error'
    }
  };

  const config = typeConfig[type];

  return (
    <Modal
      ref={ref}
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className={className}
      {...props}
    >
      <ModalHeader onClose={onClose}>
        <div className="flex items-center space-x-3">
          {showIcon && (
            <div className={cn('p-2 rounded-lg', config.bgColor, config.borderColor)}>
              {config.icon}
            </div>
          )}
          <ModalTitle className={config.textColor}>{title}</ModalTitle>
        </div>
      </ModalHeader>
      
      <ModalBody>
        <p className="text-text-secondary">{message}</p>
      </ModalBody>
      
      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          OK
        </button>
      </ModalFooter>
    </Modal>
  );
});

// Loading Modal Component
const LoadingModal = React.forwardRef(({
  isOpen,
  title = 'Loading...',
  message = 'Please wait while we process your request.',
  showSpinner = true,
  className = '',
  ...props
}, ref) => {
  return (
    <Modal
      ref={ref}
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing
      size="sm"
      className={className}
      {...props}
    >
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      
      <ModalBody>
        <div className="flex flex-col items-center space-y-4 py-4">
          {showSpinner && (
            <div className="spinner w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          )}
          <p className="text-text-secondary text-center">{message}</p>
        </div>
      </ModalBody>
    </Modal>
  );
});

ModalOverlay.displayName = 'ModalOverlay';
ModalContent.displayName = 'ModalContent';
ModalHeader.displayName = 'ModalHeader';
ModalTitle.displayName = 'ModalTitle';
ModalDescription.displayName = 'ModalDescription';
ModalBody.displayName = 'ModalBody';
ModalFooter.displayName = 'ModalFooter';
Modal.displayName = 'Modal';
ConfirmationModal.displayName = 'ConfirmationModal';
AlertModal.displayName = 'AlertModal';
LoadingModal.displayName = 'LoadingModal';

export {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ConfirmationModal,
  AlertModal,
  LoadingModal
};

export default Modal;
