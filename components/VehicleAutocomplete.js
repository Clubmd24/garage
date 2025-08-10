import { useState, useEffect } from 'react';

export default function VehicleAutocomplete({ 
  value, 
  onChange, 
  onSelect, 
  customerId, 
  fleetId,
  placeholder = "Search vehicles by license plate or description"
}) {
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
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('q', term);
    if (customerId) params.append('customer_id', customerId);
    if (fleetId) params.append('fleet_id', fleetId);
    
    fetch(`/api/vehicles?${params.toString()}`)
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
  }, [term, customerId, fleetId]);

  const handleSelect = (vehicle) => {
    onSelect && onSelect(vehicle);
    const displayValue = vehicle.licence_plate || vehicle.description || '';
    if (value === undefined) {
      setTerm('');
    } else {
      setTerm(displayValue);
      onChange && onChange(displayValue);
    }
    setResults([]);
    setIsOpen(false);
  };

  const handleBlur = () => {
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
        placeholder={placeholder}
      />
      {isOpen && term && results.length > 0 && (
        <div className="absolute z-10 bg-white shadow rounded w-full text-black border max-h-60 overflow-y-auto">
          {results.map(vehicle => (
            <div
              key={vehicle.id}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelect(vehicle)}
            >
              <div className="font-medium">{vehicle.licence_plate || 'No Plate'}</div>
              <div className="text-sm text-gray-600">
                {vehicle.make} {vehicle.model} {vehicle.year}
                {vehicle.description && ` - ${vehicle.description}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
