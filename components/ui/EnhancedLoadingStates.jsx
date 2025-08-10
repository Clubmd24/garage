import { motion } from 'framer-motion';
import { Loader2, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Enhanced Skeleton Loader
export function Skeleton({ className = '', variant = 'default', ...props }) {
  const baseClasses = 'skeleton-modern rounded';
  
  const variants = {
    default: baseClasses,
    text: `${baseClasses} h-4`,
    title: `${baseClasses} h-6`,
    subtitle: `${baseClasses} h-5`,
    avatar: `${baseClasses} w-12 h-12 rounded-full`,
    card: `${baseClasses} h-32`,
    button: `${baseClasses} h-10 w-24`,
    input: `${baseClasses} h-10 w-full`,
    table: `${baseClasses} h-16 w-full`,
    chart: `${baseClasses} h-48 w-full`,
    list: `${baseClasses} h-20 w-full`,
    stats: `${baseClasses} h-24 w-full`,
    navigation: `${baseClasses} h-12 w-full`,
    sidebar: `${baseClasses} h-8 w-full`,
    header: `${baseClasses} h-16 w-full`,
    footer: `${baseClasses} h-20 w-full`
  };

  return (
    <div 
      className={`${variants[variant]} ${className}`}
      {...props}
    />
  );
}

// Enhanced Skeleton Card
export function SkeletonCard({ variant = 'default', className = '', ...props }) {
  const variants = {
    default: 'p-6 space-y-4',
    compact: 'p-4 space-y-3',
    spacious: 'p-8 space-y-6',
    minimal: 'p-3 space-y-2'
  };

  return (
    <div className={`card-modern ${variants[variant]} ${className}`} {...props}>
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" className="w-3/4" />
          <Skeleton variant="subtitle" className="w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-5/6" />
        <Skeleton variant="text" className="w-4/6" />
      </div>
    </div>
  );
}

// Enhanced Skeleton Table
export function SkeletonTable({ rows = 5, columns = 4, className = '', ...props }) {
  return (
    <div className={`card-modern p-6 ${className}`} {...props}>
      {/* Header */}
      <div className="flex space-x-4 mb-6">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} variant="title" className="flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={`cell-${rowIndex}-${colIndex}`} 
                variant="text" 
                className="flex-1" 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced Skeleton Dashboard
export function SkeletonDashboard({ className = '', ...props }) {
  return (
    <div className={`dashboard-grid ${className}`} {...props}>
      {/* Stats Cards */}
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={`stats-${i}`} variant="compact" />
      ))}
      
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <SkeletonCard variant="spacious" />
        <SkeletonTable rows={6} columns={3} />
      </div>
      
      {/* Sidebar */}
      <div className="space-y-6">
        <SkeletonCard variant="compact" />
        <SkeletonCard variant="compact" />
      </div>
    </div>
  );
}

// Enhanced Spinner
export function Spinner({ 
  size = 'md', 
  variant = 'default', 
  className = '', 
  ...props 
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variants = {
    default: 'border-primary',
    success: 'border-success',
    warning: 'border-warning',
    error: 'border-error',
    info: 'border-info',
    accent: 'border-accent'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`spinner ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

// Enhanced Loading Spinner
export function LoadingSpinner({ 
  text = 'Loading...', 
  size = 'md', 
  variant = 'default',
  className = '',
  ...props 
}) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`} {...props}>
      <Spinner size={size} variant={variant} />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-text-secondary text-sm font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// Enhanced Progress Bar
export function ProgressBar({ 
  value = 0, 
  max = 100, 
  variant = 'default', 
  showLabel = true,
  size = 'md',
  className = '',
  ...props 
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variants = {
    default: 'bg-gradient-to-r from-primary to-primary-light',
    success: 'bg-gradient-to-r from-success to-success-light',
    warning: 'bg-gradient-to-r from-warning to-warning-light',
    error: 'bg-gradient-to-r from-error to-error-light',
    info: 'bg-gradient-to-r from-info to-info-light',
    accent: 'bg-gradient-to-r from-accent to-accent-light'
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between text-sm text-text-tertiary mb-2">
          <span>Progress</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className={`progress-bar ${sizes[size]}`}>
        <motion.div
          className={`progress-fill ${variants[variant]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// Enhanced Circular Progress
export function CircularProgress({ 
  value = 0, 
  max = 100, 
  size = 'md', 
  variant = 'default',
  showLabel = true,
  className = '',
  ...props 
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = size === 'sm' ? 20 : size === 'md' ? 30 : size === 'lg' ? 40 : 50;
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : size === 'lg' ? 6 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variants = {
    default: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning',
    error: 'stroke-error',
    info: 'stroke-info',
    accent: 'stroke-accent'
  };

  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`} {...props}>
      <div className={`relative ${sizes[size]}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${radius * 2 + strokeWidth} ${radius * 2 + strokeWidth}`}>
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-surface-tertiary opacity-30"
          />
          {/* Progress circle */}
          <motion.circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className={variants[variant]}
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-text-primary">
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Loading Overlay
export function LoadingOverlay({ 
  isLoading = false, 
  text = 'Loading...',
  variant = 'default',
  className = '',
  ...props 
}) {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay backdrop-blur-sm ${className}`}
      {...props}
    >
      <div className="bg-surface-elevated border border-border-primary rounded-2xl p-8 shadow-2xl">
        <LoadingSpinner text={text} variant={variant} size="lg" />
      </div>
    </motion.div>
  );
}

// Enhanced Loading States for Different Components
export function LoadingStates() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Loading States</h2>
      
      {/* Skeleton Examples */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-text-secondary">Skeleton Loaders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard variant="compact" />
          <SkeletonCard variant="default" />
          <SkeletonCard variant="spacious" />
        </div>
      </div>

      {/* Spinners */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-text-secondary">Spinners</h3>
        <div className="flex items-center space-x-8">
          <LoadingSpinner text="Small" size="sm" />
          <LoadingSpinner text="Medium" size="md" />
          <LoadingSpinner text="Large" size="lg" />
          <LoadingSpinner text="Extra Large" size="xl" />
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-text-secondary">Progress Bars</h3>
        <div className="space-y-4">
          <ProgressBar value={25} variant="default" />
          <ProgressBar value={50} variant="success" />
          <ProgressBar value={75} variant="warning" />
          <ProgressBar value={90} variant="error" />
        </div>
      </div>

      {/* Circular Progress */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-text-secondary">Circular Progress</h3>
        <div className="flex items-center space-x-8">
          <CircularProgress value={25} variant="default" />
          <CircularProgress value={50} variant="success" />
          <CircularProgress value={75} variant="warning" />
          <CircularProgress value={90} variant="error" />
        </div>
      </div>

      {/* Skeleton Table */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-text-secondary">Skeleton Table</h3>
        <SkeletonTable rows={4} columns={3} />
      </div>

      {/* Skeleton Dashboard */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-text-secondary">Skeleton Dashboard</h3>
        <SkeletonDashboard />
      </div>
    </div>
  );
}

// Enhanced Status Loading Indicator
export function StatusLoadingIndicator({ 
  status = 'loading', 
  text = '', 
  className = '',
  ...props 
}) {
  const statusConfig = {
    loading: {
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
      color: 'text-info',
      bgColor: 'bg-info/20',
      borderColor: 'border-info/30'
    },
    pending: {
      icon: <Clock className="w-5 h-5" />,
      color: 'text-warning',
      bgColor: 'bg-warning/20',
      borderColor: 'border-warning/30'
    },
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-success',
      bgColor: 'bg-success/20',
      borderColor: 'border-success/30'
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-error',
      bgColor: 'bg-error/20',
      borderColor: 'border-error/30'
    }
  };

  const config = statusConfig[status] || statusConfig.loading;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
      {...props}
    >
      <div className={config.color}>
        {config.icon}
      </div>
      {text && (
        <span className={`text-sm font-medium ${config.color}`}>
          {text}
        </span>
      )}
    </motion.div>
  );
}

// Enhanced Loading Button
export function LoadingButton({ 
  children, 
  loading = false, 
  loadingText = 'Loading...',
  variant = 'default',
  className = '',
  ...props 
}) {
  const baseClasses = 'btn-modern flex items-center justify-center space-x-2 transition-all duration-200';
  
  const variants = {
    default: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-surface-secondary text-text-primary hover:bg-surface-tertiary',
    success: 'bg-success text-white hover:bg-success-dark',
    warning: 'bg-warning text-white hover:bg-warning-dark',
    error: 'bg-error text-white hover:bg-error-dark'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" variant="default" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
} 