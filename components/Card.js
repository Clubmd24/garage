export function Card({ children, className = '' }) {
  return (
    <div className={`p-4 bg-[var(--color-surface)] rounded-2xl shadow ${className}`}>
      {children}
    </div>
  );
}
