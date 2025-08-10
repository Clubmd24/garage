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
    // If we have a customerId or fleetId, always fetch vehicles
    // This makes it "dumb proof" - shows options immediately when client is selected
    if (customerId || fleetId) {
      let cancel = false;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (term) params.append('q', term);
      params.append('customer_id', customerId || '');
      params.append('fleet_id', fleetId || '');
      
      fetch(`/api/vehicles?${params.toString()}`)
        .then(r => (r.ok ? r.json() : []))
        .then(data => {
          if (cancel) return;
          setResults(data);
          // Show dropdown if we have results, even without search term
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
    } else {
      // No client selected, only search if user types something
      if (!term) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      
      let cancel = false;
      
      fetch(`/api/vehicles?q=${encodeURIComponent(term)}`)
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
    }
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
      {isOpen && results.length > 0 && (
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
