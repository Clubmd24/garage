import React from 'react';
import { cn } from '@/lib/utils';

// Base Card Component
const Card = React.forwardRef(({ 
  children, 
  className = '', 
  variant = 'default',
  elevated = false,
  glass = false,
  hover = true,
  ...props 
}, ref) => {
  const baseClasses = 'card-modern';
  
  const variantClasses = {
    default: '',
    stats: 'card-stats',
    warning: 'card-warning',
    danger: 'card-danger',
    info: 'card-info',
    success: 'card-success'
  };

  const elevationClasses = elevated ? 'card-elevated' : '';
  const glassClasses = glass ? 'card-glass' : '';
  const hoverClasses = hover ? 'hover:transform hover:translateY(-4px) hover:scale-1.02' : '';

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    elevationClasses,
    glassClasses,
    hoverClasses,
    className
  );

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

// Card Header Component
const CardHeader = React.forwardRef(({ 
  children, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div 
      ref={ref} 
      className={cn('flex flex-col space-y-1.5 p-6 pb-0', className)} 
      {...props}
    >
      {children}
    </div>
  );
});

// Card Title Component
const CardTitle = React.forwardRef(({ 
  children, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <h3 
      ref={ref} 
      className={cn('text-2xl font-semibold leading-none tracking-tight text-text-primary', className)} 
      {...props}
    >
      {children}
    </h3>
  );
});

// Card Description Component
const CardDescription = React.forwardRef(({ 
  children, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <p 
      ref={ref} 
      className={cn('text-sm text-text-secondary', className)} 
      {...props}
    >
      {children}
    </p>
  );
});

// Card Content Component
const CardContent = React.forwardRef(({ 
  children, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div 
      ref={ref} 
      className={cn('p-6 pt-0', className)} 
      {...props}
    >
      {children}
    </div>
  );
});

// Card Footer Component
const CardFooter = React.forwardRef(({ 
  children, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div 
      ref={ref} 
      className={cn('flex items-center p-6 pt-0', className)} 
      {...props}
    >
      {children}
    </div>
  );
});

// Stats Card Component
const StatsCard = React.forwardRef(({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon, 
  className = '', 
  ...props 
}, ref) => {
  const changeClasses = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-text-tertiary'
  };

  const changeIcon = {
    positive: '↗',
    negative: '↘',
    neutral: '→'
  };

  return (
    <Card ref={ref} variant="stats" className={cn('relative overflow-hidden', className)} {...props}>
      {icon && (
        <div className="absolute top-4 right-4 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      )}
      <CardContent>
        <div className="flex flex-col space-y-2">
          <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-text-primary">
              {value}
            </span>
            {change && (
              <span className={cn('text-sm font-medium flex items-center', changeClasses[changeType])}>
                {changeIcon[changeType]} {change}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Metric Card Component
const MetricCard = React.forwardRef(({ 
  label, 
  value, 
  unit, 
  trend, 
  trendValue, 
  trendType = 'neutral',
  className = '', 
  ...props 
}, ref) => {
  const trendClasses = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-text-tertiary'
  };

  return (
    <Card ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
      <CardContent>
        <div className="flex flex-col space-y-3">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-text-primary">
              {value}
            </span>
            {unit && (
              <span className="text-sm text-text-tertiary font-normal">
                {unit}
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary uppercase tracking-wider">
            {label}
          </p>
          {trend && (
            <div className={cn('flex items-center space-x-2 text-sm font-medium', trendClasses[trendType])}>
              <span>{trend}</span>
              {trendValue && (
                <span>
                  {trendType === 'positive' ? '+' : ''}{trendValue}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// Quick Action Card Component
const QuickActionCard = React.forwardRef(({ 
  title, 
  description, 
  icon, 
  onClick, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <Card 
      ref={ref} 
      className={cn('cursor-pointer group', className)} 
      onClick={onClick}
      {...props}
    >
      <CardContent>
        <div className="flex flex-col items-center text-center space-y-4">
          {icon && (
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              {icon}
            </div>
          )}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-text-secondary leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Job Card Component (for mechanics)
const JobCard = React.forwardRef(({ 
  jobId, 
  title, 
  status, 
  priority, 
  client, 
  vehicle, 
  estimatedTime, 
  onClick, 
  className = '', 
  ...props 
}, ref) => {
  const priorityClasses = {
    low: 'border-l-success',
    medium: 'border-l-warning',
    high: 'border-l-error',
    urgent: 'border-l-error'
  };

  const statusClasses = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    in_progress: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-success/10 text-success border-success/20',
    cancelled: 'bg-error/10 text-error border-error/20'
  };

  return (
    <Card 
      ref={ref} 
      className={cn('job-card-mechanic cursor-pointer', priorityClasses[priority], className)} 
      onClick={onClick}
      {...props}
    >
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-text-primary">{title}</h3>
              <p className="text-sm text-text-secondary">Job #{jobId}</p>
            </div>
            <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', statusClasses[status])}>
              {status.replace('_', ' ')}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-text-tertiary">Client</p>
              <p className="text-text-primary font-medium">{client}</p>
            </div>
            <div>
              <p className="text-text-tertiary">Vehicle</p>
              <p className="text-text-primary font-medium">{vehicle}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-tertiary">Est. Time: {estimatedTime}</span>
            {priority === 'urgent' && (
              <span className="status-urgent">URGENT</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Admin Card Component (for office staff)
const AdminCard = React.forwardRef(({ 
  title, 
  subtitle, 
  value, 
  trend, 
  trendType = 'neutral',
  icon, 
  className = '', 
  ...props 
}, ref) => {
  const trendClasses = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-text-tertiary'
  };

  return (
    <Card ref={ref} className={cn('admin-card', className)} {...props}>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            {subtitle && (
              <p className="text-sm text-text-secondary">{subtitle}</p>
            )}
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-text-primary">{value}</span>
              {trend && (
                <span className={cn('text-sm font-medium', trendClasses[trendType])}>
                  {trend}
                </span>
              )}
            </div>
          </div>
          {icon && (
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// Service Card Component (for vehicle owners)
const ServiceCard = React.forwardRef(({ 
  serviceName, 
  status, 
  progress, 
  estimatedCompletion, 
  description, 
  className = '', 
  ...props 
}, ref) => {
  const statusClasses = {
    scheduled: 'text-warning',
    in_progress: 'text-primary',
    completed: 'text-success',
    delayed: 'text-error'
  };

  return (
    <Card ref={ref} className={cn('service-card', className)} {...props}>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">{serviceName}</h3>
            <span className={cn('text-sm font-medium', statusClasses[status])}>
              {status.replace('_', ' ')}
            </span>
          </div>
          
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-tertiary">Progress</span>
              <span className="text-text-primary font-medium">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {estimatedCompletion && (
            <p className="text-sm text-text-tertiary">
              Estimated completion: {estimatedCompletion}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';
StatsCard.displayName = 'StatsCard';
MetricCard.displayName = 'MetricCard';
QuickActionCard.displayName = 'QuickActionCard';
JobCard.displayName = 'JobCard';
AdminCard.displayName = 'AdminCard';
ServiceCard.displayName = 'ServiceCard';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatsCard,
  MetricCard,
  QuickActionCard,
  JobCard,
  AdminCard,
  ServiceCard
};

export default Card;
