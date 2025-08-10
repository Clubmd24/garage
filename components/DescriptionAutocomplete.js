import { useState, useEffect } from 'react';

export default function DescriptionAutocomplete({ value, onChange, onSelect }) {
  const [term, setTerm] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value !== undefined) setTerm(value);
  }, [value]);

  useEffect(() => {
    if (!term) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    let cancel = false;
    fetch(`/api/parts?q=${encodeURIComponent(term)}`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        if (cancel) return;
        setResults(data);
        setIsOpen(data.length > 0);
      })
      .catch(() => {
        if (cancel) return;
        setResults([]);
        setIsOpen(false);
      });
    return () => {
      cancel = true;
    };
  }, [term]);

  const handleSelect = (part) => {
    // First, close the dropdown immediately
    setResults([]);
    setIsOpen(false);
    
    // Then handle the selection
    onSelect && onSelect(part);
    const desc = part.description || '';
    if (value === undefined) {
      setTerm('');
    } else {
      setTerm(desc);
      onChange && onChange(desc);
    }
  };

  const handleBlur = () => {
    // Close dropdown when input loses focus
    setTimeout(() => {
      setIsOpen(false);
      setResults([]);
    }, 150);
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
        onBlur={handleBlur}
        placeholder="Description"
      />
      {isOpen && term && results.length > 0 && (
        <div className="absolute z-10 bg-white shadow rounded w-full text-black border">
          {results.map(p => (
            <div
              key={p.id}
              className="px-2 py-1 cursor-pointer hover:bg-gray-200"
              onClick={() => handleSelect(p)}
            >
              {p.description} - {p.part_number}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
