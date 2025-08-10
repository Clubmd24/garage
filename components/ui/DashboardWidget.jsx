import React from 'react';
import { cn } from '@/lib/utils';

const DashboardWidget = React.forwardRef(({ 
  className, 
  variant = 'default',
  title,
  subtitle,
  value,
  change,
  changeType = 'neutral',
  icon,
  trend,
  actions,
  loading = false,
  children,
  ...props 
}, ref) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20';
      case 'success':
        return 'bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20';
      case 'warning':
        return 'bg-gradient-to-br from-warning/10 via-warning/5 to-transparent border-warning/20';
      case 'error':
        return 'bg-gradient-to-br from-error/10 via-error/5 to-transparent border-error/20';
      case 'accent':
        return 'bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent/20';
      default:
        return 'bg-gradient-to-br from-surface-primary via-surface-secondary to-surface-primary border-border-primary/50';
    }
  };

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

  if (loading) {
    return (
      <div
        ref={ref}
        className={cn(
          'dashboard-card animate-pulse',
          getVariantClasses(),
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-surface-secondary rounded w-1/3"></div>
          <div className="h-8 w-8 bg-surface-secondary rounded-full"></div>
        </div>
        <div className="h-8 bg-surface-secondary rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-surface-secondary rounded w-1/4"></div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        'dashboard-card relative overflow-hidden group',
        getVariantClasses(),
        'hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-out',
        className
      )}
      {...props}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Top section with title and icon */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-text-muted">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
            {icon}
          </div>
        )}
      </div>

      {/* Main value */}
      {value && (
        <div className="mb-3 relative z-10">
          <div className="text-3xl font-bold text-text-primary group-hover:text-gradient transition-all duration-300">
            {value}
          </div>
        </div>
      )}

      {/* Change indicator */}
      {change && (
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <span className={cn("text-sm font-medium flex items-center gap-1", getChangeColor())}>
            <span className="text-lg">{getChangeIcon()}</span>
            {change}
          </span>
          {trend && (
            <span className="text-xs text-text-muted">vs {trend}</span>
          )}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2 mt-4 relative z-10">
          {actions}
        </div>
      )}

      {/* Custom content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
});

DashboardWidget.displayName = 'DashboardWidget';

// Specialized widget variants
export function MetricWidget({ 
  metric,
  label,
  icon,
  trend,
  className,
  ...props 
}) {
  return (
    <DashboardWidget
      className={cn("text-center", className)}
      {...props}
    >
      {icon && (
        <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
          {icon}
        </div>
      )}
      <div className="text-2xl font-bold text-text-primary mb-1">{metric}</div>
      <div className="text-sm text-text-secondary">{label}</div>
      {trend && (
        <div className="text-xs text-text-muted mt-2">{trend}</div>
      )}
    </DashboardWidget>
  );
}

export function ChartWidget({ 
  title,
  chart,
  className,
  ...props 
}) {
  return (
    <DashboardWidget
      className={cn("", className)}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
      )}
      <div className="w-full h-48 flex items-center justify-center">
        {chart}
      </div>
    </DashboardWidget>
  );
}

export function QuickActionWidget({ 
  title,
  actions,
  className,
  ...props 
}) {
  return (
    <DashboardWidget
      className={cn("", className)}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
      )}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="p-3 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-all duration-200 hover:scale-105"
          >
            <div className="w-8 h-8 mx-auto mb-2 bg-primary/10 rounded-lg flex items-center justify-center">
              {action.icon}
            </div>
            <div className="text-xs font-medium text-text-primary">{action.label}</div>
          </button>
        ))}
      </div>
    </DashboardWidget>
  );
}

export default DashboardWidget; 