import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

// Breadcrumb Component
const Breadcrumb = React.forwardRef(({
  items = [],
  separator = '/',
  className = '',
  ...props
}, ref) => {
  if (!items.length) return null;

  return (
    <nav
      ref={ref}
      className={cn('flex items-center space-x-2 text-sm', className)}
      aria-label="Breadcrumb"
      {...props}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isLink = item.href && !isLast;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-text-tertiary mx-2">
                {separator}
              </span>
            )}
            
            {isLink ? (
              <a
                href={item.href}
                className={cn(
                  'text-text-secondary hover:text-text-primary transition-colors duration-200',
                  'hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded'
                )}
              >
                {item.label}
              </a>
            ) : (
              <span
                className={cn(
                  'text-text-primary font-medium',
                  isLast && 'text-text-primary'
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
});

// Tab Component
const Tab = React.forwardRef(({
  children,
  active = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'tab-item',
        'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        active
          ? 'bg-primary text-white shadow-sm'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

// Tab Group Component
const TabGroup = React.forwardRef(({
  tabs = [],
  activeTab = 0,
  onTabChange,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const [activeIndex, setActiveIndex] = useState(activeTab);

  useEffect(() => {
    setActiveIndex(activeTab);
  }, [activeTab]);

  const handleTabChange = (index) => {
    if (tabs[index]?.disabled) return;
    
    setActiveIndex(index);
    onTabChange?.(index, tabs[index]);
  };

  const variantClasses = {
    default: 'border-b border-border-primary',
    pills: 'space-x-1',
    underline: 'border-b border-border-primary'
  };

  const tabVariantClasses = {
    default: 'border-b-2 border-transparent rounded-none px-4 py-3',
    pills: 'rounded-full px-4 py-2',
    underline: 'border-b-2 border-transparent rounded-none px-4 py-3'
  };

  return (
    <div
      ref={ref}
      className={cn('tab-group', variantClasses[variant], className)}
      {...props}
    >
      <div className="flex space-x-1">
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            active={index === activeIndex}
            disabled={tab.disabled}
            onClick={() => handleTabChange(index)}
            className={cn(tabVariantClasses[variant], tab.className)}
          >
            {tab.icon && (
              <span className="mr-2">
                {tab.icon}
              </span>
            )}
            {tab.label}
            {tab.badge && (
              <span className={cn(
                'ml-2 px-2 py-0.5 text-xs rounded-full',
                index === activeIndex
                  ? 'bg-white/20 text-white'
                  : 'bg-surface-tertiary text-text-secondary'
              )}>
                {tab.badge}
              </span>
            )}
          </Tab>
        ))}
      </div>
      
      {/* Tab Content */}
      {tabs[activeIndex]?.content && (
        <div className="mt-4">
          {tabs[activeIndex].content}
        </div>
      )}
    </div>
  );
});

// Pagination Component
const Pagination = React.forwardRef(({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showInfo = true,
  showItemsPerPage = true,
  className = '',
  ...props
}, ref) => {
  const pageNumbers = React.useMemo(() => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    if (page !== '...' && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange?.(page);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      ref={ref}
      className={cn('flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0', className)}
      {...props}
    >
      {/* Page Info */}
      {showInfo && (
        <div className="text-sm text-text-secondary">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
      )}

      {/* Items Per Page */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center space-x-2">
          <label className="text-sm text-text-secondary">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            className="px-3 py-1 text-sm border border-border-primary rounded-md bg-surface-primary text-text-primary focus:outline-none focus:border-border-accent"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      )}

      {/* Page Navigation */}
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="sr-only">Previous</span>
        </Button>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => (
          <Button
            key={index}
            variant={page === currentPage ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePageChange(page)}
            disabled={page === '...'}
            className={cn(
              'px-3 py-2 min-w-[40px]',
              page === '...' && 'cursor-default'
            )}
          >
            {page}
          </Button>
        ))}

        {/* Next Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>
  );
});

// Stepper Component
const Stepper = React.forwardRef(({
  steps = [],
  currentStep = 0,
  onStepClick,
  className = '',
  ...props
}, ref) => {
  const handleStepClick = (stepIndex) => {
    if (stepIndex <= currentStep && onStepClick) {
      onStepClick(stepIndex);
    }
  };

  return (
    <div
      ref={ref}
      className={cn('stepper w-full', className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index <= currentStep;

          return (
            <React.Fragment key={index}>
              {/* Step */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    'stepper-step',
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isCompleted
                      ? 'bg-success text-white'
                      : isCurrent
                      ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                      : 'bg-surface-secondary text-text-secondary',
                    isClickable && 'cursor-pointer hover:scale-105',
                    !isClickable && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </button>
                
                {/* Step Label */}
                <div className="mt-2 text-center">
                  <div className={cn(
                    'text-sm font-medium',
                    isCompleted || isCurrent ? 'text-text-primary' : 'text-text-secondary'
                  )}>
                    {step.label}
                  </div>
                  {step.description && (
                    <div className={cn(
                      'text-xs mt-1',
                      isCompleted || isCurrent ? 'text-text-secondary' : 'text-text-tertiary'
                    )}>
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-4',
                  isCompleted ? 'bg-success' : 'bg-border-primary'
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
});

// Navigation Menu Component
const NavigationMenu = React.forwardRef(({
  items = [],
  orientation = 'horizontal',
  className = '',
  ...props
}, ref) => {
  const [activeItem, setActiveItem] = useState(null);

  const orientationClasses = {
    horizontal: 'flex-row space-x-1',
    vertical: 'flex-col space-y-1'
  };

  return (
    <nav
      ref={ref}
      className={cn('navigation-menu', orientationClasses[orientation], className)}
      {...props}
    >
      {items.map((item, index) => {
        const isActive = activeItem === index || item.active;

        return (
          <a
            key={index}
            href={item.href}
            onClick={(e) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick(item, index);
              }
              setActiveItem(index);
            }}
            className={cn(
              'navigation-item',
              'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              isActive
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
            )}
          >
            {item.icon && (
              <span className="mr-2">
                {item.icon}
              </span>
            )}
            {item.label}
            {item.badge && (
              <span className={cn(
                'ml-2 px-2 py-0.5 text-xs rounded-full',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-surface-tertiary text-text-secondary'
              )}>
                {item.badge}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
});

Breadcrumb.displayName = 'Breadcrumb';
Tab.displayName = 'Tab';
TabGroup.displayName = 'TabGroup';
Pagination.displayName = 'Pagination';
Stepper.displayName = 'Stepper';
NavigationMenu.displayName = 'NavigationMenu';

export {
  Breadcrumb,
  Tab,
  TabGroup,
  Pagination,
  Stepper,
  NavigationMenu
};

export default TabGroup; 