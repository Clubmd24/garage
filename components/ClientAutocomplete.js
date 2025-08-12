import { useState, useEffect } from 'react';

export default function ClientAutocomplete({ 
  value, 
  onChange, 
  onSelect,
  placeholder = "Search by client name or email"
}) {
  const [term, setTerm] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (value !== undefined) setTerm(value);
  }, [value]);

  useEffect(() => {
    if (!term || term.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    let cancel = false;

    // Search for clients and their vehicles
    Promise.all([
      fetch(`/api/clients?q=${encodeURIComponent(term)}`).then(r => r.ok ? r.json() : []),
      fetch(`/api/vehicles?q=${encodeURIComponent(term)}`).then(r => r.ok ? r.json() : [])
    ])
      .then(([clients, vehicles]) => {
        if (cancel) return;
        
        // Group vehicles by client
        const clientVehicles = {};
        vehicles.forEach(vehicle => {
          if (vehicle.customer_id) {
            if (!clientVehicles[vehicle.customer_id]) {
              clientVehicles[vehicle.customer_id] = [];
            }
            clientVehicles[vehicle.customer_id].push(vehicle);
          }
        });
        
        // Format results to show client name and their vehicles
        const formattedResults = clients.map(client => {
          const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
          const clientVehiclesList = clientVehicles[client.id] || [];
          
          return {
            id: client.id,
            displayName: clientName,
            email: client.email,
            phone: client.mobile || client.landline,
            vehicles: clientVehiclesList,
            data: client
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
  }, [term]);

  const handleSelect = (client) => {
    console.log('Client selected:', client); // Debug log
    onSelect && onSelect(client);
    setTerm(client.displayName);
    setIsOpen(false);
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
        onFocus={() => {
          if (results.length > 0) setIsOpen(true);
        }}
        placeholder={placeholder}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((client) => (
            <div
              key={client.id}
              onClick={() => handleSelect(client)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{client.displayName}</div>
              {client.email && (
                <div className="text-sm text-gray-600">{client.email}</div>
              )}
              {client.phone && (
                <div className="text-sm text-gray-500">{client.phone}</div>
              )}
              {client.vehicles && client.vehicles.length > 0 && (
                <div className="text-xs text-blue-600 mt-1">
                  Vehicles: {client.vehicles.map(v => v.licence_plate || 'No Plate').join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
