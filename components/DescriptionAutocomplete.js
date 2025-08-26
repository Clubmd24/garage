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
    }, 100);
  };

  return (
    <div className="relative">
      <input
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={term}
        onChange={e => {
          setTerm(e.target.value);
          onChange && onChange(e.target.value);
        }}
        onBlur={handleBlur}
        placeholder="Description"
      />
      {isOpen && term && results.length > 0 && (
        <div className="absolute z-50 bg-white shadow-lg rounded w-full text-black border border-gray-300">
          {results.map(p => (
            <div
              key={p.id}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
              onClick={() => handleSelect(p)}
            >
              <div className="font-medium text-gray-900">{p.description}</div>
              <div className="text-sm text-gray-600">{p.part_number}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
