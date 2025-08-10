import React from 'react';

// Badge component with multiple variants
export function Badge({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '',
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variants = {
    default: 'bg-surface-secondary text-text-primary border border-border-primary',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-surface-tertiary text-text-primary border border-border-primary',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    error: 'bg-error text-error-foreground',
    info: 'bg-info text-info-foreground',
    accent: 'bg-accent text-accent-foreground',
    stats: 'bg-gradient-to-r from-primary to-accent text-white',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

// Status indicator with dot
export function StatusIndicator({ 
  status, 
  showText = true, 
  size = 'default',
  className = '' 
}) {
  const statusConfig = {
    active: { color: 'bg-success', text: 'Active' },
    pending: { color: 'bg-warning', text: 'Pending' },
    completed: { color: 'bg-success', text: 'Completed' },
    cancelled: { color: 'bg-error', text: 'Cancelled' },
    in_progress: { color: 'bg-info', text: 'In Progress' },
    scheduled: { color: 'bg-accent', text: 'Scheduled' },
    overdue: { color: 'bg-error', text: 'Overdue' },
    approved: { color: 'bg-success', text: 'Approved' },
    rejected: { color: 'bg-error', text: 'Rejected' },
    paid: { color: 'bg-success', text: 'Paid' },
    unpaid: { color: 'bg-warning', text: 'Unpaid' },
    draft: { color: 'bg-surface-tertiary', text: 'Draft' },
    submitted: { color: 'bg-info', text: 'Submitted' },
    processing: { color: 'bg-accent', text: 'Processing' },
    shipped: { color: 'bg-info', text: 'Shipped' },
    delivered: { color: 'bg-success', text: 'Delivered' },
    returned: { color: 'bg-error', text: 'Returned' },
    maintenance: { color: 'bg-warning', text: 'Maintenance' },
    operational: { color: 'bg-success', text: 'Operational' },
    offline: { color: 'bg-error', text: 'Offline' },
    online: { color: 'bg-success', text: 'Online' },
    busy: { color: 'bg-warning', text: 'Busy' },
    available: { color: 'bg-success', text: 'Available' },
    unavailable: { color: 'bg-error', text: 'Unavailable' },
  };
  
  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  
  const sizes = {
    sm: 'w-2 h-2',
    default: 'w-3 h-3',
    lg: 'w-4 h-4',
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${config.color} ${sizes[size]} rounded-full`}></div>
      {showText && (
        <span className="text-sm text-text-primary">{config.text}</span>
      )}
    </div>
  );
}

// Priority indicator
export function PriorityIndicator({ 
  priority, 
  showText = true, 
  size = 'default',
  className = '' 
}) {
  const priorityConfig = {
    low: { color: 'bg-success', text: 'Low' },
    medium: { color: 'bg-warning', text: 'Medium' },
    high: { color: 'bg-error', text: 'High' },
    critical: { color: 'bg-error', text: 'Critical' },
    urgent: { color: 'bg-error', text: 'Urgent' },
  };
  
  const config = priorityConfig[priority?.toLowerCase()] || priorityConfig.medium;
  
  const sizes = {
    sm: 'w-2 h-2',
    default: 'w-3 h-3',
    lg: 'w-4 h-4',
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${config.color} ${sizes[size]} rounded-full`}></div>
      {showText && (
        <span className="text-sm text-text-primary">{config.text}</span>
      )}
    </div>
  );
}

// Health indicator
export function HealthIndicator({ 
  health, 
  showText = true, 
  size = 'default',
  className = '' 
}) {
  const healthConfig = {
    excellent: { color: 'bg-success', text: 'Excellent' },
    good: { color: 'bg-success', text: 'Good' },
    fair: { color: 'bg-warning', text: 'Fair' },
    poor: { color: 'bg-error', text: 'Poor' },
    critical: { color: 'bg-error', text: 'Critical' },
  };
  
  const config = healthConfig[health?.toLowerCase()] || healthConfig.good;
  
  const sizes = {
    sm: 'w-2 h-2',
    default: 'w-3 h-3',
    lg: 'w-4 h-4',
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${config.color} ${sizes[size]} rounded-full`}></div>
      {showText && (
        <span className="text-sm text-text-primary">{config.text}</span>
      )}
    </div>
  );
}

// Progress indicator
export function ProgressIndicator({ 
  progress, 
  size = 'default',
  showPercentage = true,
  className = '' 
}) {
  const progressValue = Math.min(Math.max(progress || 0, 0), 100);
  
  const sizes = {
    sm: 'h-2',
    default: 'h-3',
    lg: 'h-4',
  };
  
  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-success';
    if (value >= 60) return 'bg-info';
    if (value >= 40) return 'bg-warning';
    return 'bg-error';
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full ${sizes[size]} bg-surface-secondary rounded-full overflow-hidden`}>
        <div 
          className={`${getProgressColor(progressValue)} ${sizes[size]} transition-all duration-300 ease-out`}
          style={{ width: `${progressValue}%` }}
        ></div>
      </div>
      {showPercentage && (
        <div className="text-xs text-text-secondary mt-1 text-right">
          {progressValue}%
        </div>
      )}
    </div>
  );
}

// Connection status indicator
export function ConnectionIndicator({ 
  connected, 
  showText = true,
  className = '' 
}) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-3 h-3 rounded-full ${connected ? 'bg-success' : 'bg-error'}`}></div>
      {showText && (
        <span className="text-sm text-text-primary">
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      )}
    </div>
  );
}

// Battery indicator
export function BatteryIndicator({ 
  level, 
  showText = true,
  className = '' 
}) {
  const getBatteryColor = (batteryLevel) => {
    if (batteryLevel >= 60) return 'bg-success';
    if (batteryLevel >= 30) return 'bg-warning';
    return 'bg-error';
  };
  
  const getBatteryIcon = (batteryLevel) => {
    if (batteryLevel >= 80) return '🔋';
    if (batteryLevel >= 60) return '🔋';
    if (batteryLevel >= 40) return '🔋';
    if (batteryLevel >= 20) return '🔋';
    return '🔋';
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-lg">{getBatteryIcon(level)}</span>
      <div className="w-16 h-2 bg-surface-secondary rounded-full overflow-hidden">
        <div 
          className={`${getBatteryColor(level)} h-2 transition-all duration-300 ease-out`}
          style={{ width: `${level}%` }}
        ></div>
      </div>
      {showText && (
        <span className="text-sm text-text-primary">{level}%</span>
      )}
    </div>
  );
}

// All components are already exported above 