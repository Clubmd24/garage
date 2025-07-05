import { useState, useEffect } from 'react';

export default function ClientAutocomplete({ value, onChange, onSelect }) {
  const [term, setTerm] = useState(value || '');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (value !== undefined) setTerm(value);
  }, [value]);

  useEffect(() => {
    if (!term) return setResults([]);
    let cancel = false;
    fetch(`/api/clients?q=${encodeURIComponent(term)}`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        if (cancel) return;
        setResults(data);
      })
      .catch(() => {
        if (cancel) return;
        setResults([]);
      });
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
        placeholder="Client name or email"
      />
      {term && results.length > 0 && (
        <div className="absolute z-10 bg-white shadow rounded w-full text-black">
          {results.map(c => (
            <div
              key={c.id}
              className="px-2 py-1 cursor-pointer hover:bg-gray-200"
              onClick={() => {
                onSelect && onSelect(c);
                const name = `${c.first_name || ''} ${c.last_name || ''}`.trim();
                if (value === undefined) {
                  setTerm('');
                } else {
                  setTerm(name);
                }
                setResults([]);
              }}
            >
              {(c.first_name || '') + ' ' + (c.last_name || '')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
