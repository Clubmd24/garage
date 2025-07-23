import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientAutocomplete({ value, onChange, onSelect }) {
  const [term, setTerm] = useState(value || '');
  const [results, setResults] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (value !== undefined) setTerm(value);
  }, [value]);

  useEffect(() => {
    if (!term) {
      setResults([]);
      setShowAdd(false);
      return;
    }
    let cancel = false;
    fetch(`/api/clients?q=${encodeURIComponent(term)}`)
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
      {term && (results.length > 0 || showAdd) && (
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
          {showAdd && (
            <Link href="/office/clients/new" className="block px-2 py-1 hover:bg-gray-200">
              Add Client
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
