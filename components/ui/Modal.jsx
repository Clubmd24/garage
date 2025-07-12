import React from 'react';

export function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl p-4 max-h-[80vh] overflow-y-auto">
        {children}
        {onClose && (
          <div className="mt-4 text-right">
            <button className="button px-4" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
