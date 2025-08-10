import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import Button from './Button';

// Toast Notification Component
const Toast = React.forwardRef(({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  className = '',
  action,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-dismiss
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(timer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  }, [id, onClose]);

  const handleAction = () => {
    if (action?.onClick) {
      action.onClick();
      handleClose();
    }
  };

  const typeConfig = {
    success: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      textColor: 'text-success',
      iconColor: 'text-success'
    },
    error: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-error/10',
      borderColor: 'border-error/20',
      textColor: 'text-error',
      iconColor: 'text-error'
    },
    warning: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      textColor: 'text-warning',
      iconColor: 'text-warning'
    },
    info: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-info/10',
      borderColor: 'border-info/20',
      textColor: 'text-info',
      iconColor: 'text-info'
    }
  };

  const config = typeConfig[type];

  return (
    <div
      ref={ref}
      className={cn(
        'toast-notification',
        'relative p-4 rounded-lg border backdrop-blur-sm shadow-lg',
        'transform transition-all duration-300 ease-out',
        config.bgColor,
        config.borderColor,
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95',
        isExiting ? 'translate-x-full opacity-0 scale-95' : '',
        'min-w-[320px] max-w-[420px]',
        className
      )}
      {...props}
    >
      {/* Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg">
          <div
            className="h-full bg-current transition-all duration-300 ease-linear"
            style={{
              width: isExiting ? '0%' : '100%',
              transitionDuration: `${duration}ms`
            }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', config.iconColor)}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn('text-sm font-semibold mb-1', config.textColor)}>
              {title}
            </h4>
          )}
          {message && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {message}
            </p>
          )}
          
          {/* Action Button */}
          {action && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAction}
                className={cn('text-xs px-3 py-1', config.textColor)}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={cn(
            'flex-shrink-0 p-1 rounded-md transition-colors',
            'hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
            'focus:ring-current'
          )}
        >
          <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
});

// Alert Component
const Alert = React.forwardRef(({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
  dismissible = true,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const typeConfig = {
    success: {
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      textColor: 'text-success',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    error: {
      bgColor: 'bg-error/10',
      borderColor: 'border-error/20',
      textColor: 'text-error',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    warning: {
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      textColor: 'text-warning',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    info: {
      bgColor: 'bg-info/10',
      borderColor: 'border-info/20',
      textColor: 'text-info',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const config = typeConfig[type];

  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'alert-notification',
        'p-4 rounded-lg border backdrop-blur-sm',
        config.bgColor,
        config.borderColor,
        'transform transition-all duration-300',
        className
      )}
      {...props}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', config.textColor)}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn('text-sm font-semibold mb-2', config.textColor)}>
              {title}
            </h4>
          )}
          <div className="text-sm text-text-secondary">
            {children}
          </div>
        </div>

        {/* Close Button */}
        {dismissible && (
          <button
            onClick={handleClose}
            className={cn(
              'flex-shrink-0 p-1 rounded-md transition-colors',
              'hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
              'focus:ring-current'
            )}
          >
            <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

// Banner Component
const Banner = React.forwardRef(({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
  dismissible = true,
  action,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const typeConfig = {
    success: {
      bgColor: 'bg-success/20',
      borderColor: 'border-success/30',
      textColor: 'text-success',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    error: {
      bgColor: 'bg-error/20',
      borderColor: 'border-error/30',
      textColor: 'text-error',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    warning: {
      bgColor: 'bg-warning/20',
      borderColor: 'border-warning/30',
      textColor: 'text-warning',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    info: {
      bgColor: 'bg-info/20',
      borderColor: 'border-info/30',
      textColor: 'text-info',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const config = typeConfig[type];

  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'banner-notification',
        'p-6 rounded-lg border backdrop-blur-sm shadow-lg',
        config.bgColor,
        config.borderColor,
        'transform transition-all duration-300',
        className
      )}
      {...props}
    >
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-1', config.textColor)}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn('text-lg font-semibold mb-2', config.textColor)}>
              {title}
            </h3>
          )}
          <div className="text-base text-text-secondary leading-relaxed">
            {children}
          </div>
          
          {/* Action Button */}
          {action && (
            <div className="mt-4">
              <Button
                variant="ghost"
                onClick={action.onClick}
                className={cn('text-sm px-4 py-2', config.textColor)}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        {/* Close Button */}
        {dismissible && (
          <button
            onClick={handleClose}
            className={cn(
              'flex-shrink-0 p-2 rounded-md transition-colors',
              'hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
              'focus:ring-current'
            )}
          >
            <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

// Toast Container Component
const ToastContainer = ({ toasts, onClose, position = 'top-right', className = '' }) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  if (!toasts.length) return null;

  return (
    <div
      className={cn(
        'fixed z-50 space-y-3',
        positionClasses[position],
        className
      )}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

// Notification Context and Hook
const NotificationContext = React.createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [banners, setBanners] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addAlert = useCallback((alert) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlert = { ...alert, id };
    setAlerts(prev => [...prev, newAlert]);
    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const addBanner = useCallback((banner) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newBanner = { ...banner, id };
    setBanners(prev => [...prev, newBanner]);
    return id;
  }, []);

  const removeBanner = useCallback((id) => {
    setBanners(prev => prev.filter(banner => banner.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
    setAlerts([]);
    setBanners([]);
  }, []);

  const value = {
    toasts,
    alerts,
    banners,
    addToast,
    removeToast,
    addAlert,
    removeAlert,
    addBanner,
    removeBanner,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        position="top-right"
      />
      
      {/* Alert Container */}
      {alerts.length > 0 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 space-y-3">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              {...alert}
              onClose={() => removeAlert(alert.id)}
            />
          ))}
        </div>
      )}
      
      {/* Banner Container */}
      {banners.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 space-y-3 p-4">
          {banners.map((banner) => (
            <Banner
              key={banner.id}
              {...banner}
              onClose={() => removeBanner(banner.id)}
            />
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Utility functions for quick notifications
export const showToast = (notification) => {
  // This would be called from outside the component tree
  // Implementation depends on your app structure
  console.log('Toast notification:', notification);
};

export const showAlert = (notification) => {
  console.log('Alert notification:', notification);
};

export const showBanner = (notification) => {
  console.log('Banner notification:', notification);
};

Toast.displayName = 'Toast';
Alert.displayName = 'Alert';
Banner.displayName = 'Banner';
ToastContainer.displayName = 'ToastContainer';

export {
  Toast,
  Alert,
  Banner,
  ToastContainer
};

export default Toast; 