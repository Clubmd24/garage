import { useState, useEffect } from 'react';

export default function PartAutocomplete({ value, onChange, onSelect }) {
  const [term, setTerm] = useState(value || '');
  const [results, setResults] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (value !== undefined) setTerm(value);
  }, [value]);

  useEffect(() => {
    if (!term) return setResults([]);
    let cancel = false;
    fetch(`/api/parts?q=${encodeURIComponent(term)}`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        if (cancel) return;
        setResults(data);
        setShowAdd(data.length === 0);
      })
      .catch(() => {
        if (cancel) return;
        setResults([]);
        setShowAdd(true);
      });
    return () => {
      cancel = true;
    };
  }, [term]);

  const addPart = async () => {
    try {
      const res = await fetch('/api/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ part_number: term, description: term }),
      });
      const created = await res.json();
      setResults([created]);
      setShowAdd(false);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      <input
        className="input w-full"
        value={term}
        onChange={e => {
          setTerm(e.target.value);
          onChange && onChange(e.target.value);
        }}
        placeholder="Part number or description"
      />
      {term && (
        <div className="absolute z-10 bg-white shadow rounded w-full text-black">
          {results.map(p => (
            <div
              key={p.id}
              className="px-2 py-1 cursor-pointer hover:bg-gray-200"
              onClick={() => {
                onSelect && onSelect(p);
                if (value === undefined) {
                  setTerm('');
                } else {
                  setTerm(p.part_number);
                  onChange && onChange(p.part_number);
                }
                setResults([]);
              }}
            >
              {p.part_number} - {p.description}
            </div>
          ))}
          {showAdd && (
            <div
              className="px-2 py-1 cursor-pointer hover:bg-gray-200"
              onClick={addPart}
            >
              Add Part &quot;{term}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
