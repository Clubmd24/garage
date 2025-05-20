// File: components/Card.js
import cn from 'classnames';

/**
 * Card component: wraps content in a rounded, shadowed container with padding.
 * @param {{children: React.ReactNode, className?: string}} props
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