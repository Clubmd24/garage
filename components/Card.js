import cn from 'classnames';

/**
 * Card component for our design system
 */
export function Card({ children, className = '' }) {
  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] rounded-2xl shadow-xl p-6',
        className
      )}
    >
      {children}
    </div>
  );
}
