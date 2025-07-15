// components/Card.js

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-gray-100 text-gray-900 rounded-2xl shadow-xl p-6 ${className}`}>
      {children}
    </div>
  );
}
