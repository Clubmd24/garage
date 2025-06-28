export function Card({ children, className = '' }) {
  return (
    <div className={`text-black dark:text-white p-4 bg-[var(--color-surface)] rounded-2xl shadow ${className}`}>
      {children}
    </div>
  );
}
