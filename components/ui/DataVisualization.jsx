import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Progress Bar Component
const ProgressBar = React.forwardRef(({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = true,
  animated = true,
  className = '',
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-info'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div
      ref={ref}
      className={cn('progress-bar w-full', className)}
      {...props}
    >
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className={cn('font-medium text-text-primary', labelSizeClasses[size])}>
            Progress
          </span>
          <span className={cn('text-text-secondary', labelSizeClasses[size])}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={cn(
        'w-full bg-surface-secondary rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            variantClasses[variant],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

// Circular Progress Component
const CircularProgress = React.forwardRef(({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = true,
  animated = true,
  strokeWidth = 4,
  className = '',
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const variantClasses = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div
      ref={ref}
      className={cn('circular-progress flex flex-col items-center', className)}
      {...props}
    >
      <div className={cn('relative', sizeClasses[size])}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-surface-secondary"
          />
          
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-1000 ease-out',
              variantClasses[variant]
            )}
          />
        </svg>
        
        {/* Center label */}
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'font-bold text-text-primary',
              labelSizeClasses[size]
            )}>
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
      
      {showLabel && (
        <span className={cn(
          'mt-2 text-text-secondary text-center',
          labelSizeClasses[size]
        )}>
          Progress
        </span>
      )}
    </div>
  );
});

// Status Indicator Component
const StatusIndicator = React.forwardRef(({
  status = 'default',
  size = 'md',
  showLabel = true,
  animated = false,
  className = '',
  ...props
}, ref) => {
  const statusConfig = {
    default: {
      color: 'bg-surface-tertiary',
      text: 'text-text-tertiary',
      label: 'Default'
    },
    online: {
      color: 'bg-success',
      text: 'text-success',
      label: 'Online'
    },
    offline: {
      color: 'bg-error',
      text: 'text-error',
      label: 'Offline'
    },
    busy: {
      color: 'bg-warning',
      text: 'text-warning',
      label: 'Busy'
    },
    away: {
      color: 'bg-info',
      text: 'text-info',
      label: 'Away'
    }
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const config = statusConfig[status] || statusConfig.default;

  return (
    <div
      ref={ref}
      className={cn('status-indicator flex items-center space-x-2', className)}
      {...props}
    >
      <div
        className={cn(
          'rounded-full',
          sizeClasses[size],
          config.color,
          animated && 'animate-pulse'
        )}
      />
      
      {showLabel && (
        <span className={cn(
          'font-medium',
          config.text,
          labelSizeClasses[size]
        )}>
          {config.label}
        </span>
      )}
    </div>
  );
});

// Metric Card Component
const MetricCard = React.forwardRef(({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  trend,
  className = '',
  ...props
}, ref) => {
  const changeConfig = {
    positive: {
      color: 'text-success',
      icon: '↗',
      bg: 'bg-success/10'
    },
    negative: {
      color: 'text-error',
      icon: '↘',
      bg: 'bg-error/10'
    },
    neutral: {
      color: 'text-text-secondary',
      icon: '→',
      bg: 'bg-surface-secondary'
    }
  };

  const config = changeConfig[changeType];

  return (
    <div
      ref={ref}
      className={cn(
        'metric-card',
        'p-6 bg-surface-primary border border-border-primary rounded-lg',
        'hover:shadow-lg transition-all duration-200',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary">
          {title}
        </h3>
        {icon && (
          <div className="p-2 rounded-lg bg-surface-secondary">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <p className="text-2xl font-bold text-text-primary">
          {value}
        </p>
      </div>
      
      {change && (
        <div className="flex items-center space-x-2">
          <span className={cn(
            'text-sm font-medium',
            config.color
          )}>
            {config.icon} {change}
          </span>
          {trend && (
            <span className={cn(
              'px-2 py-1 text-xs rounded-full',
              config.bg,
              config.color
            )}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

// Chart Container Component
const ChartContainer = React.forwardRef(({
  children,
  title,
  subtitle,
  actions,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'chart-container',
        'p-6 bg-surface-primary border border-border-primary rounded-lg',
        className
      )}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-text-primary">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-text-secondary mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
});

// Simple Bar Chart Component
const SimpleBarChart = React.forwardRef(({
  data = [],
  height = 200,
  showValues = true,
  className = '',
  ...props
}, ref) => {
  const maxValue = Math.max(...data.map(item => item.value), 0);
  
  return (
    <div
      ref={ref}
      className={cn('simple-bar-chart', className)}
      {...props}
    >
      <div
        className="flex items-end space-x-2"
        style={{ height: `${height}px` }}
      >
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="relative w-full">
              <div
                className="bg-primary rounded-t transition-all duration-500 ease-out hover:bg-primary/80"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              />
              {showValues && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-text-secondary">
                  {item.value}
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-text-secondary text-center">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Simple Line Chart Component
const SimpleLineChart = React.forwardRef(({
  data = [],
  height = 200,
  showPoints = true,
  className = '',
  ...props
}, ref) => {
  const maxValue = Math.max(...data.map(item => item.value), 0);
  const minValue = Math.min(...data.map(item => item.value), 0);
  const range = maxValue - minValue;
  
  const points = data.map((item, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: range > 0 ? ((item.value - minValue) / range) * 100 : 50
  }));

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${100 - point.y}`
  ).join(' ');

  return (
    <div
      ref={ref}
      className={cn('simple-line-chart relative', className)}
      style={{ height: `${height}px` }}
      {...props}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border-primary/30" />
          </pattern>
        </defs>
        
        <rect width="100" height="100" fill="url(#grid)" />
        
        {/* Line path */}
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />
        
        {/* Data points */}
        {showPoints && points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={100 - point.y}
            r="2"
            fill="currentColor"
            className="text-primary"
          />
        ))}
      </svg>
      
      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-text-secondary">
        {data.map((item, index) => (
          <span key={index} className="text-center">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
});

// Data Table Component
const DataTable = React.forwardRef(({
  data = [],
  columns = [],
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('data-table overflow-x-auto', className)}
      {...props}
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-primary">
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-sm font-medium text-text-primary bg-surface-secondary"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border-primary/50 hover:bg-surface-secondary/50 transition-colors"
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-3 text-sm text-text-secondary"
                >
                  {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// Legend Component
const Legend = React.forwardRef(({
  items = [],
  orientation = 'horizontal',
  className = '',
  ...props
}, ref) => {
  const orientationClasses = {
    horizontal: 'flex-row space-x-4',
    vertical: 'flex-col space-y-2'
  };

  return (
    <div
      ref={ref}
      className={cn('legend flex items-center', orientationClasses[orientation], className)}
      {...props}
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-text-secondary">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';
CircularProgress.displayName = 'CircularProgress';
StatusIndicator.displayName = 'StatusIndicator';
MetricCard.displayName = 'MetricCard';
ChartContainer.displayName = 'ChartContainer';
SimpleBarChart.displayName = 'SimpleBarChart';
SimpleLineChart.displayName = 'SimpleLineChart';
DataTable.displayName = 'DataTable';
Legend.displayName = 'Legend';

export {
  ProgressBar,
  CircularProgress,
  StatusIndicator,
  MetricCard,
  ChartContainer,
  SimpleBarChart,
  SimpleLineChart,
  DataTable,
  Legend
};

export default MetricCard; 