import { useState, useEffect } from 'react';

export default function VehicleAutocomplete({ value, onChange, onSelect }) {
  const [term, setTerm] = useState(value || '');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (value !== undefined) setTerm(value);
  }, [value]);

  useEffect(() => {
    if (!term) return setResults([]);
    let cancel = false;
    fetch('/api/vehicles')
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        if (cancel) return;
        const q = term.toLowerCase();
        setResults(
          data.filter(v =>
            (v.licence_plate || '').toLowerCase().includes(q) ||
            (v.make || '').toLowerCase().includes(q) ||
            (v.model || '').toLowerCase().includes(q)
          )
        );
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
        placeholder="Vehicle search"
      />
      {term && results.length > 0 && (
        <div className="absolute z-10 bg-white shadow rounded w-full text-black">
          {results.map(v => (
            <div
              key={v.id}
              className="px-2 py-1 cursor-pointer hover:bg-gray-200"
              onClick={() => {
                onSelect && onSelect(v);
                if (value === undefined) {
                  setTerm('');
                } else {
                  setTerm(v.licence_plate);
                }
                setResults([]);
              }}
            >
              {v.licence_plate} {v.make} {v.model}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
