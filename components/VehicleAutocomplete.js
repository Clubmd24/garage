import { useState, useEffect } from 'react';

export default function VehicleAutocomplete({ 
  value, 
  onChange, 
  onSelect,
  customerId,
  fleetId,
  placeholder = "Search by license plate or VIN"
}) {
  const [term, setTerm] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (value !== undefined && value !== term) {
      setTerm(value);
      // Close dropdown when value is set externally
      setIsOpen(false);
      // Clear results when value is set externally to prevent dropdown from showing
      setResults([]);
    }
  }, [value, term]);

  useEffect(() => {
    // Don't search if the term is exactly the same as the value (selected vehicle)
    if (!term || term.length < 1 || term === value) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    let cancel = false;

    // Build search query
    let searchUrl = `/api/vehicles?q=${encodeURIComponent(term)}`;
    if (customerId) {
      searchUrl += `&customer_id=${customerId}`;
    } else if (fleetId) {
      searchUrl += `&fleet_id=${fleetId}`;
    }

    // Search for vehicles
    fetch(searchUrl)
      .then(r => r.ok ? r.json() : [])
      .then(vehicles => {
        if (cancel) return;
        
        // Format results to show vehicle info and associated client/fleet
        const formattedResults = vehicles.map(vehicle => {
          const vehicleDisplay = `${vehicle.licence_plate || 'No Plate'} - ${vehicle.make} ${vehicle.model}`;
          
          // Get associated client/fleet name
          let associatedName = '';
          if (vehicle.customer_name) {
            associatedName = vehicle.customer_name;
          } else if (vehicle.fleet_id && vehicle.fleet_id !== 2) {
            // This would need to be fetched separately or included in the API response
            associatedName = `Fleet Vehicle`;
          }
          
          return {
            id: vehicle.id,
            displayName: vehicleDisplay,
            licensePlate: vehicle.licence_plate,
            make: vehicle.make,
            model: vehicle.model,
            vin: vehicle.vin_number,
            customerId: vehicle.customer_id,
            fleetId: vehicle.fleet_id,
            associatedName: associatedName,
            data: vehicle
          };
        });
        
        setResults(formattedResults);
        setIsOpen(formattedResults.length > 0);
      })
      .catch(() => {
        if (cancel) return;
        setResults([]);
        setIsOpen(false);
      })
      .finally(() => {
        if (!cancel) setIsLoading(false);
      });

    return () => {
      cancel = true;
    };
  }, [term, customerId, fleetId, value]);

  const handleSelect = (vehicle) => {
    onSelect && onSelect(vehicle);
    setTerm(vehicle.displayName);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Small delay to allow click events to fire first
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          onChange && onChange(e.target.value);
        }}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => handleSelect(vehicle)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{vehicle.displayName}</div>
              {vehicle.associatedName && (
                <div className="text-sm text-gray-600">{vehicle.associatedName}</div>
              )}
              {vehicle.vin && (
                <div className="text-sm text-gray-500">VIN: {vehicle.vin}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
