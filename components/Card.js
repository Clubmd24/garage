// components/Card.js

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white text-gray-900 rounded-2xl shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
}
