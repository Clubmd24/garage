import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PartAutocomplete({
  value,
  onChange,
  onSelect,
  description,
  unit_cost,
}) {
  const [term, setTerm] = useState(value || '');
  const [results, setResults] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();

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

  const addPart = () => {
    const params = new URLSearchParams();
    params.append('part_number', term);
    if (description) params.append('description', description);
    if (unit_cost !== undefined && unit_cost !== '')
      params.append('unit_cost', unit_cost);
    params.append('redirect', '/office/quotations/new');
    router.push(`/office/parts/new?${params.toString()}`);
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
      {term && (results.length > 0 || showAdd) && (
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
