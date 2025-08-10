import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Container Component
const Container = React.forwardRef(({
  children,
  size = 'lg',
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'max-w-4xl',
    md: 'max-w-6xl',
    lg: 'max-w-7xl',
    xl: 'max-w-full',
    full: 'max-w-none'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'container mx-auto px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

// Grid Component
const Grid = React.forwardRef(({
  children,
  cols = 1,
  gap = 'md',
  className = '',
  ...props
}, ref) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-10'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'grid',
        gridCols[cols] || gridCols[1],
        gapClasses[gap] || gapClasses.md,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

// Flex Container Component
const Flex = React.forwardRef(({
  children,
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = 'nowrap',
  gap = 'md',
  className = '',
  ...props
}, ref) => {
  const directionClasses = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    col: 'flex-col',
    'col-reverse': 'flex-col-reverse'
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  };

  const wrapClasses = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse'
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-10'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        directionClasses[direction] || directionClasses.row,
        justifyClasses[justify] || justifyClasses.start,
        alignClasses[align] || alignClasses.start,
        wrapClasses[wrap] || wrapClasses.nowrap,
        gapClasses[gap] || gapClasses.md,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

// Section Component
const Section = React.forwardRef(({
  children,
  padding = 'lg',
  margin = 'none',
  background = 'default',
  className = '',
  ...props
}, ref) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'py-4 px-4 sm:px-6',
    md: 'py-8 px-4 sm:px-6',
    lg: 'py-12 px-4 sm:px-6 lg:px-8',
    xl: 'py-16 px-4 sm:px-6 lg:px-8',
    '2xl': 'py-20 px-4 sm:px-6 lg:px-8'
  };

  const marginClasses = {
    none: 'm-0',
    sm: 'my-4',
    md: 'my-8',
    lg: 'my-12',
    xl: 'my-16',
    '2xl': 'my-20'
  };

  const backgroundClasses = {
    default: 'bg-surface-primary',
    secondary: 'bg-surface-secondary',
    tertiary: 'bg-surface-tertiary',
    elevated: 'bg-surface-elevated'
  };

  return (
    <section
      ref={ref}
      className={cn(
        'section',
        paddingClasses[padding] || paddingClasses.lg,
        marginClasses[margin] || marginClasses.none,
        backgroundClasses[background] || backgroundClasses.default,
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
});

// Card Grid Component
const CardGrid = React.forwardRef(({
  children,
  cols = 3,
  gap = 'lg',
  className = '',
  ...props
}, ref) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-10'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'card-grid',
        'grid',
        gridCols[cols] || gridCols[3],
        gapClasses[gap] || gapClasses.lg,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

// Sidebar Layout Component
const SidebarLayout = React.forwardRef(({
  children,
  sidebar,
  sidebarWidth = 'md',
  sidebarPosition = 'left',
  className = '',
  ...props
}, ref) => {
  const sidebarWidths = {
    sm: 'w-64',
    md: 'w-72',
    lg: 'w-80',
    xl: 'w-96'
  };

  const layoutClasses = {
    left: 'flex-row',
    right: 'flex-row-reverse'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'sidebar-layout',
        'flex min-h-screen',
        layoutClasses[sidebarPosition] || layoutClasses.left,
        className
      )}
      {...props}
    >
      {/* Sidebar */}
      <aside className={cn(
        'sidebar',
        'flex-shrink-0',
        sidebarWidths[sidebarWidth] || sidebarWidths.md,
        'border-r border-border-primary bg-surface-secondary'
      )}>
        {sidebar}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
});

// Split Layout Component
const SplitLayout = React.forwardRef(({
  children,
  left,
  right,
  ratio = '50/50',
  className = '',
  ...props
}, ref) => {
  const ratioClasses = {
    '25/75': 'grid-cols-1 lg:grid-cols-4',
    '30/70': 'grid-cols-1 lg:grid-cols-10',
    '40/60': 'grid-cols-1 lg:grid-cols-5',
    '50/50': 'grid-cols-1 lg:grid-cols-2',
    '60/40': 'grid-cols-1 lg:grid-cols-5',
    '70/30': 'grid-cols-1 lg:grid-cols-10',
    '75/25': 'grid-cols-1 lg:grid-cols-4'
  };

  const leftCols = {
    '25/75': 'lg:col-span-1',
    '30/70': 'lg:col-span-3',
    '40/60': 'lg:col-span-2',
    '50/50': 'lg:col-span-1',
    '60/40': 'lg:col-span-3',
    '70/30': 'lg:col-span-7',
    '75/25': 'lg:col-span-3'
  };

  const rightCols = {
    '25/75': 'lg:col-span-3',
    '30/70': 'lg:col-span-7',
    '40/60': 'lg:col-span-3',
    '50/50': 'lg:col-span-1',
    '60/40': 'lg:col-span-2',
    '70/30': 'lg:col-span-3',
    '75/25': 'lg:col-span-1'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'split-layout',
        'grid gap-6',
        ratioClasses[ratio] || ratioClasses['50/50'],
        className
      )}
      {...props}
    >
      {/* Left Panel */}
      <div className={cn(
        'left-panel',
        leftCols[ratio] || leftCols['50/50']
      )}>
        {left}
      </div>

      {/* Right Panel */}
      <div className={cn(
        'right-panel',
        rightCols[ratio] || rightCols['50/50']
      )}>
        {right}
      </div>
    </div>
  );
});

// Masonry Grid Component
const MasonryGrid = React.forwardRef(({
  children,
  cols = 3,
  gap = 'md',
  className = '',
  ...props
}, ref) => {
  const gridCols = {
    2: 'columns-1 sm:columns-2',
    3: 'columns-1 sm:columns-2 lg:columns-3',
    4: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4',
    5: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-5',
    6: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-6'
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-10'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'masonry-grid',
        gridCols[cols] || gridCols[3],
        gapClasses[gap] || gapClasses.md,
        'space-y-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

// Responsive Container Component
const ResponsiveContainer = React.forwardRef(({
  children,
  breakpoints = {},
  className = '',
  ...props
}, ref) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState('default');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width >= 1536) {
        setCurrentBreakpoint('2xl');
      } else if (width >= 1280) {
        setCurrentBreakpoint('xl');
      } else if (width >= 1024) {
        setCurrentBreakpoint('lg');
      } else if (width >= 768) {
        setCurrentBreakpoint('md');
      } else if (width >= 640) {
        setCurrentBreakpoint('sm');
      } else {
        setCurrentBreakpoint('default');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const breakpointClasses = breakpoints[currentBreakpoint] || breakpoints.default || '';

  return (
    <div
      ref={ref}
      className={cn(
        'responsive-container',
        breakpointClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

// Stack Component
const Stack = React.forwardRef(({
  children,
  spacing = 'md',
  direction = 'vertical',
  className = '',
  ...props
}, ref) => {
  const spacingClasses = {
    none: 'space-y-0 space-x-0',
    sm: 'space-y-2 space-x-2',
    md: 'space-y-4 space-x-4',
    lg: 'space-y-6 space-x-6',
    xl: 'space-y-8 space-x-8'
  };

  const directionClasses = {
    vertical: 'flex flex-col',
    horizontal: 'flex flex-row',
    'vertical-reverse': 'flex flex-col-reverse',
    'horizontal-reverse': 'flex flex-row-reverse'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'stack',
        directionClasses[direction] || directionClasses.vertical,
        spacingClasses[spacing] || spacingClasses.md,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

// Aspect Ratio Container Component
const AspectRatio = React.forwardRef(({
  children,
  ratio = '16/9',
  className = '',
  ...props
}, ref) => {
  const ratioClasses = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '21/9': 'aspect-[21/9]',
    '3/2': 'aspect-[3/2]',
    '5/4': 'aspect-[5/4]'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'aspect-ratio-container',
        'relative overflow-hidden',
        ratioClasses[ratio] || ratioClasses['16/9'],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Container.displayName = 'Container';
Grid.displayName = 'Grid';
Flex.displayName = 'Flex';
Section.displayName = 'Section';
CardGrid.displayName = 'CardGrid';
SidebarLayout.displayName = 'SidebarLayout';
SplitLayout.displayName = 'SplitLayout';
MasonryGrid.displayName = 'MasonryGrid';
ResponsiveContainer.displayName = 'ResponsiveContainer';
Stack.displayName = 'Stack';
AspectRatio.displayName = 'AspectRatio';

export {
  Container,
  Grid,
  Flex,
  Section,
  CardGrid,
  SidebarLayout,
  SplitLayout,
  MasonryGrid,
  ResponsiveContainer,
  Stack,
  AspectRatio
};

export default Container; 