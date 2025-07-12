import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  return (
    <div
      role="alert"
      className={`${bg} text-white px-4 py-2 rounded fixed top-4 right-4`}
    >
      {message}
    </div>
  );
}
