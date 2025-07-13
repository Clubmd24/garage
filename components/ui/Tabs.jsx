import React, { useState } from 'react';

export default function Tabs({ tabs, className = '', selected, onChange }) {
  const [internal, setInternal] = useState(tabs[0]?.label);
  const active = selected ?? internal;
  const setActive = onChange ?? setInternal;
  const current = tabs.find(t => t.label === active) || tabs[0];
  return (
    <div className={className}>
      <div className="flex border-b mb-4 gap-2">
        {tabs.map(t => (
          <button
            key={t.label}
            onClick={() => setActive(t.label)}
            className={`px-3 py-2 ${active === t.label ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>{current && current.content}</div>
    </div>
  );
}
