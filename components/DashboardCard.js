import Link from 'next/link';
import { cn } from '@/lib/utils';

export function DashboardCard({ 
  href, 
  title, 
  Icon, 
  description,
  badge,
  className = '',
  ...props 
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-surface-primary border border-border-primary',
        'transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1',
        'hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-primary',
        className
      )}
      {...props}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative p-6 text-center space-y-4">
        {/* Icon with animated background */}
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors duration-300" />
          <div className="relative flex items-center justify-center w-full h-full">
            <Icon />
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        
        {/* Description */}
        {description && (
          <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-300">
            {description}
          </p>
        )}
        
        {/* Badge */}
        {badge && (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            {badge}
          </div>
        )}
      </div>
      
      {/* Hover effect line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Link>
  );
}

// Specialized dashboard card variants
export function StatDashboardCard({ 
  href, 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  Icon,
  className = '',
  ...props 
}) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-error';
      case 'warning': return 'text-warning';
      default: return 'text-text-secondary';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return '↗';
      case 'negative': return '↘';
      case 'warning': return '→';
      default: return '';
    }
  };

  return (
    <Link
      href={href}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-surface-primary border border-border-primary',
        'transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1',
        'hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-primary',
        className
      )}
      {...props}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Header with icon and title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <Icon />
              </div>
            )}
            <h3 className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors duration-300">
              {title}
            </h3>
          </div>
        </div>
        
        {/* Value */}
        <div className="text-3xl font-bold text-text-primary group-hover:text-primary transition-colors duration-300">
          {value}
        </div>
        
        {/* Change indicator */}
        {change && (
          <div className={cn("flex items-center gap-1 text-sm font-medium", getChangeColor())}>
            <span className="text-lg">{getChangeIcon()}</span>
            {change}
          </div>
        )}
      </div>
      
      {/* Hover effect line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Link>
  );
}

export function ActionDashboardCard({ 
  href, 
  title, 
  description, 
  actionText = 'View',
  Icon,
  className = '',
  ...props 
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-surface-primary border border-border-primary',
        'transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1',
        'hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-primary',
        className
      )}
      {...props}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Icon */}
        {Icon && (
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
            <Icon />
          </div>
        )}
        
        {/* Text content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-300">
              {description}
            </p>
          )}
        </div>
        
        {/* Action button */}
        <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium group-hover:bg-primary group-hover:text-white transition-all duration-300">
          {actionText}
          <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 5-7 5V5z" />
          </svg>
        </div>
      </div>
      
      {/* Hover effect line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Link>
  );
}

export function QuickActionCard({ 
  onClick, 
  title, 
  description, 
  Icon,
  variant = 'primary',
  className = '',
  ...props 
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': return 'hover:bg-primary hover:text-white hover:border-primary';
      case 'accent': return 'hover:bg-accent hover:text-white hover:border-accent';
      case 'success': return 'hover:bg-success hover:text-white hover:border-success';
      case 'warning': return 'hover:bg-warning hover:text-white hover:border-warning';
      case 'error': return 'hover:bg-error hover:text-white hover:border-error';
      default: return 'hover:bg-primary hover:text-white hover:border-primary';
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-surface-primary border border-border-primary w-full text-left',
        'transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1',
        'hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-primary',
        getVariantStyles(),
        className
      )}
      {...props}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Icon */}
        {Icon && (
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
            <Icon />
          </div>
        )}
        
        {/* Text content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold transition-colors duration-300">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-text-secondary group-hover:text-white/80 transition-colors duration-300">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Hover effect line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </button>
  );
}
