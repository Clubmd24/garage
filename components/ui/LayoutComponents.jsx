import React from 'react';

// Advanced Grid Layout Component
export function AdvancedGrid({ 
  children, 
  variant = 'default', 
  className = '',
  ...props 
}) {
  const gridClasses = {
    default: 'grid-advanced',
    compact: 'grid-advanced-compact',
    spacious: 'grid-advanced-spacious',
    masonry: 'grid-dashboard-masonry',
    main: 'grid-dashboard-main',
    sidebar: 'grid-dashboard-sidebar'
  };

  return (
    <div className={`${gridClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

// Layout Split Component
export function LayoutSplit({ 
  children, 
  direction = 'horizontal',
  className = '',
  ...props 
}) {
  const layoutClasses = {
    horizontal: 'layout-split',
    vertical: 'layout-split-vertical'
  };

  return (
    <div className={`${layoutClasses[direction]} ${className}`} {...props}>
      {children}
    </div>
  );
}

// Three Column Layout Component
export function ThreeColumnLayout({ 
  left, 
  main, 
  right, 
  className = '',
  ...props 
}) {
  return (
    <div className={`layout-three-column ${className}`} {...props}>
      <div className="left-column">{left}</div>
      <div className="main-column">{main}</div>
      <div className="right-column">{right}</div>
    </div>
  );
}

// Sidebar Layout Component
export function SidebarLayout({ 
  sidebar, 
  main, 
  sidebarPosition = 'left',
  className = '',
  ...props 
}) {
  const layoutClass = sidebarPosition === 'left' ? 'layout-sidebar-main' : 'layout-main-sidebar';

  return (
    <div className={`${layoutClass} ${className}`} {...props}>
      <div className="sidebar">{sidebar}</div>
      <div className="main-content">{main}</div>
    </div>
  );
}

// Stack Layout Component
export function StackLayout({ 
  children, 
  spacing = 'default',
  className = '',
  ...props 
}) {
  const spacingClasses = {
    none: 'space-y-0',
    xs: 'space-y-1',
    sm: 'space-y-2',
    default: 'space-y-3',
    lg: 'space-y-4',
    xl: 'space-y-5',
    '2xl': 'space-y-6',
    '3xl': 'space-y-8'
  };

  return (
    <div className={`${spacingClasses[spacing]} ${className}`} {...props}>
      {children}
    </div>
  );
}

// Horizontal Layout Component
export function HorizontalLayout({ 
  children, 
  spacing = 'default',
  align = 'center',
  stretch = false,
  className = '',
  ...props 
}) {
  const spacingClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    default: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-5',
    '2xl': 'gap-6',
    '3xl': 'gap-8'
  };

  const alignClasses = {
    start: 'flex-start',
    center: 'flex-center',
    end: 'flex-end',
    stretch: 'flex-stretch'
  };

  const layoutClass = stretch ? 'layout-horizontal-stretch' : 'layout-horizontal';

  return (
    <div className={`${layoutClass} ${spacingClasses[spacing]} ${alignClasses[align]} ${className}`} {...props}>
      {children}
    </div>
  );
}

// Center Layout Component
export function CenterLayout({ 
  children, 
  className = '',
  ...props 
}) {
  return (
    <div className={`layout-center ${className}`} {...props}>
      {children}
    </div>
  );
}

// Between Layout Component
export function BetweenLayout({ 
  children, 
  className = '',
  ...props 
}) {
  return (
    <div className={`layout-between ${className}`} {...props}>
      {children}
    </div>
  );
}

// Container Component
export function Container({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) {
  const containerClasses = {
    default: 'container-modern',
    advanced: 'container-advanced',
    fluid: 'container-fluid',
    'fluid-advanced': 'container-fluid-advanced',
    narrow: 'container-narrow',
    wide: 'container-wide'
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

// Responsive Grid Component
export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4, xl: 6 },
  gap = 'default',
  className = '',
  ...props 
}) {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    default: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-5',
    '2xl': 'gap-6',
    '3xl': 'gap-8'
  };

  const gridClasses = [
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  ].filter(Boolean).join(' ');

  return (
    <div className={`grid ${gridClasses} ${gapClasses[gap]} ${className}`} {...props}>
      {children}
    </div>
  );
}

// Card Grid Component
export function CardGrid({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) {
  const gridVariants = {
    default: 'dashboard-grid',
    compact: 'grid-advanced-compact',
    spacious: 'grid-advanced-spacious',
    masonry: 'grid-dashboard-masonry'
  };

  return (
    <div className={`${gridVariants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

// Section Component
export function Section({ 
  children, 
  title,
  subtitle,
  className = '',
  ...props 
}) {
  return (
    <section className={`mb-12 ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h2 className="text-h2 text-text-primary mb-2">{title}</h2>}
          {subtitle && <p className="text-text-secondary">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

// Divider Component
export function Divider({ 
  className = '',
  ...props 
}) {
  return (
    <hr className={`border-border-primary/20 my-8 ${className}`} {...props} />
  );
}

// Spacer Component
export function Spacer({ 
  size = 'default',
  className = '',
  ...props 
}) {
  const sizeClasses = {
    xs: 'my-1',
    sm: 'my-2',
    default: 'my-3',
    lg: 'my-4',
    xl: 'my-5',
    '2xl': 'my-6',
    '3xl': 'my-8'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`} {...props} />
  );
}

// Aspect Ratio Container
export function AspectRatio({ 
  children, 
  ratio = '16/9',
  className = '',
  ...props 
}) {
  const ratios = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '21/9': 'aspect-[21/9]'
  };

  return (
    <div className={`${ratios[ratio]} ${className}`} {...props}>
      {children}
    </div>
  );
}

// Sticky Container
export function StickyContainer({ 
  children, 
  top = '0',
  className = '',
  ...props 
}) {
  return (
    <div 
      className={`sticky ${className}`} 
      style={{ top }}
      {...props}
    >
      {children}
    </div>
  );
}

// Scroll Container
export function ScrollContainer({ 
  children, 
  direction = 'vertical',
  className = '',
  ...props 
}) {
  const scrollClasses = {
    vertical: 'overflow-y-auto',
    horizontal: 'overflow-x-auto',
    both: 'overflow-auto'
  };

  return (
    <div className={`${scrollClasses[direction]} ${className}`} {...props}>
      {children}
    </div>
  );
}

// Overlay Container
export function OverlayContainer({ 
  children, 
  className = '',
  ...props 
}) {
  return (
    <div className={`absolute inset-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

// Floating Container
export function FloatingContainer({ 
  children, 
  position = 'top-right',
  className = '',
  ...props 
}) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`} {...props}>
      {children}
    </div>
  );
} 