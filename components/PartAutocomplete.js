import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PartAutocomplete({
  value,
  onChange,
  onSelect,
  description,
  unit_cost,
  unit_sale_price,
  markup_percentage,
}) {
  const [term, setTerm] = useState(value || '');
  const [results, setResults] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (value !== undefined) setTerm(value);
  }, [value]);

  useEffect(() => {
    if (!term) {
      setResults([]);
      setShowAdd(false);
      setIsOpen(false);
      return;
    }
    let cancel = false;
    fetch(`/api/parts?q=${encodeURIComponent(term)}`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        if (cancel) return;
        setResults(data);
        setShowAdd(data.length === 0);
        setIsOpen(data.length > 0 || data.length === 0);
      })
      .catch(() => {
        if (cancel) return;
        setResults([]);
        setShowAdd(true);
        setIsOpen(true);
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
    if (unit_sale_price !== undefined && unit_sale_price !== '')
      params.append('unit_sale_price', unit_sale_price);
    if (markup_percentage !== undefined && markup_percentage !== '')
      params.append('markup_percentage', markup_percentage);
    params.append('redirect', '/office/quotations/new');
    router.push(`/office/parts/new?${params.toString()}`);
  };

  const handleSelect = (part) => {
    onSelect && onSelect(part);
    if (value === undefined) {
      setTerm('');
    } else {
      setTerm(part.part_number);
      onChange && onChange(part.part_number);
    }
    setResults([]);
    setShowAdd(false);
    setIsOpen(false);
  };

  const handleBlur = () => {
    // Close dropdown when input loses focus
    setTimeout(() => {
      setIsOpen(false);
      setResults([]);
      setShowAdd(false);
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
        placeholder="Part number or description"
      />
      {isOpen && term && (results.length > 0 || showAdd) && (
        <div className="absolute z-10 bg-white shadow rounded w-full text-black border">
          {results.map(p => (
            <div
              key={p.id}
              className="px-2 py-1 cursor-pointer hover:bg-gray-200"
              onClick={() => handleSelect(p)}
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
