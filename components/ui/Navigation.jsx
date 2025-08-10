import React, { useState } from 'react';

// Navigation Item Component
const NavItem = ({
  children,
  href,
  icon,
  active = false,
  badge,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'nav-item-modern';
  const activeClasses = active ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary';
  
  const classes = [
    baseClasses,
    activeClasses,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={classes}
      onClick={handleClick}
      {...props}
    >
      {icon && (
        <span className="mr-3 flex-shrink-0">
          {React.cloneElement(icon, { className: 'w-5 h-5' })}
        </span>
      )}
      
      <span className="flex-1">{children}</span>
      
      {badge && (
        <span className="ml-auto bg-accent text-white text-xs font-medium px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
};

// Sidebar Navigation Component
const Sidebar = ({
  children,
  className = '',
  collapsed = false,
  ...props
}) => {
  const baseClasses = 'sidebar-modern h-full transition-all duration-300';
  const collapsedClasses = collapsed ? 'w-16' : 'w-64';
  
  const classes = [
    baseClasses,
    collapsedClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <aside className={classes} {...props}>
      <div className="p-4">
        {children}
      </div>
    </aside>
  );
};

// Navigation Group Component
const NavGroup = ({
  title,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-6 ${className}`} {...props}>
      {title && (
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">
          {title}
        </h3>
      )}
      <nav className="space-y-1">
        {children}
      </nav>
    </div>
  );
};

// Top Navigation Bar Component
const TopNav = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <header className={`bg-surface-primary border-b border-border-primary backdrop-blur-xl ${className}`} {...props}>
      <div className="px-6 py-4">
        {children}
      </div>
    </header>
  );
};

// Breadcrumb Navigation Component
const Breadcrumb = ({
  items,
  className = '',
  ...props
}) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm text-text-muted ${className}`} {...props}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-border-primary mx-2">/</span>
          )}
          {index === items.length - 1 ? (
            <span className="text-text-primary font-medium">{item.label}</span>
          ) : (
            <a
              href={item.href}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              {item.label}
            </a>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Tab Navigation Component
const TabNav = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  ...props
}) => {
  return (
    <nav className={`flex space-x-1 bg-surface-secondary rounded-lg p-1 ${className}`} {...props}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary'
          }`}
        >
          {tab.label}
          {tab.badge && (
            <span className="ml-2 bg-accent text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  ...props
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  const getVisiblePages = () => {
    if (totalPages <= 7) return pages;
    
    if (currentPage <= 4) {
      return [...pages.slice(0, 5), '...', totalPages];
    }
    
    if (currentPage >= totalPages - 3) {
      return [1, '...', ...pages.slice(totalPages - 5)];
    }
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`} {...props}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      
      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            page === currentPage
              ? 'bg-primary text-white'
              : page === '...'
              ? 'text-text-muted cursor-default'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </nav>
  );
};

export {
  NavItem,
  Sidebar,
  NavGroup,
  TopNav,
  Breadcrumb,
  TabNav,
  Pagination
}; 