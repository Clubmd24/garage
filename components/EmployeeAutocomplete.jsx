import { useState, useEffect } from 'react';

export default function EmployeeAutocomplete({ value, onChange, onSelect }) {
  const [term, setTerm] = useState(value || '');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (value !== undefined) setTerm(value);
  }, [value]);

  useEffect(() => {
    if (!term) {
      setResults([]);
      return;
    }
    let cancel = false;
    const load = async () => {
      try {
        const [engRes, appRes] = await Promise.all([
          fetch('/api/engineers'),
          fetch('/api/apprentices'),
        ]);
        const [engData, appData] = await Promise.all([
          engRes.ok ? engRes.json() : [],
          appRes.ok ? appRes.json() : [],
        ]);
        if (cancel) return;
        const q = term.toLowerCase();
        const eng = engData.filter(e =>
          e.username.toLowerCase().includes(q) ||
          (e.email || '').toLowerCase().includes(q)
        ).map(e => ({ id: e.id, label: e.username }));
        const app = appData.filter(a => {
          const name = `${a.first_name || ''} ${a.last_name || ''}`.trim();
          return (
            name.toLowerCase().includes(q) ||
            (a.email || '').toLowerCase().includes(q)
          );
        }).map(a => ({ id: a.id, label: `${a.first_name || ''} ${a.last_name || ''}`.trim() }));
        setResults([...eng, ...app]);
      } catch {
        if (cancel) return;
        setResults([]);
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, [term]);

  return (
    <div className="relative">
      <input
        className="input w-full"
        value={term}
        onChange={e => {
          setTerm(e.target.value);
          onChange && onChange(e.target.value);
        }}
        placeholder="Employee name or email"
      />
      {term && results.length > 0 && (
        <div className="absolute z-10 bg-white shadow rounded w-full text-black">
          {results.map(r => (
            <div
              key={r.id}
              className="px-2 py-1 cursor-pointer hover:bg-gray-200"
              onClick={() => {
                onSelect && onSelect(r);
                if (value === undefined) {
                  setTerm('');
                } else {
                  setTerm(r.label);
                }
                setResults([]);
              }}
            >
              {r.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
