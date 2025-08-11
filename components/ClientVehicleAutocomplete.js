import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientVehicleAutocomplete({ 
  value, 
  onChange, 
  onSelect,
  placeholder = "Search by client name or vehicle license plate"
}) {
  const [term, setTerm] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (value !== undefined) setTerm(value);
  }, [value]);

  useEffect(() => {
    if (!term || term.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    let cancel = false;

    // Search for both clients and vehicles
    Promise.all([
      fetch(`/api/clients?q=${encodeURIComponent(term)}`).then(r => r.ok ? r.json() : []),
      fetch(`/api/vehicles?q=${encodeURIComponent(term)}`).then(r => r.ok ? r.json() : [])
    ])
      .then(([clients, vehicles]) => {
        if (cancel) return;
        
        // Combine and format results
        const combinedResults = [];
        
        // Add client results
        clients.forEach(client => {
          combinedResults.push({
            type: 'client',
            id: client.id,
            displayName: `${client.first_name || ''} ${client.last_name || ''}`.trim(),
            email: client.email,
            phone: client.phone,
            data: client
          });
        });
        
        // Add vehicle results with client info
        vehicles.forEach(vehicle => {
          const clientName = vehicle.customer_name || 
            (vehicle.customer_id ? `${vehicle.customer_first_name || ''} ${vehicle.customer_last_name || ''}`.trim() : '');
          
          combinedResults.push({
            type: 'vehicle',
            id: vehicle.id,
            displayName: `${vehicle.licence_plate || 'No Plate'} - ${vehicle.make} ${vehicle.model} ${vehicle.year}`,
            clientName: clientName,
            clientId: vehicle.customer_id,
            fleetId: vehicle.fleet_id,
            data: vehicle
          });
        });
        
        setResults(combinedResults);
        setIsOpen(combinedResults.length > 0);
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

  const handleSelect = (result) => {
    onSelect && onSelect(result);
    
    if (result.type === 'client') {
      // For client selection, set the client name
      if (value === undefined) {
        setTerm('');
      } else {
        setTerm(result.displayName);
        onChange && onChange(result.displayName);
      }
    } else {
      // For vehicle selection, set the vehicle display
      if (value === undefined) {
        setTerm('');
      } else {
        setTerm(result.displayName);
        onChange && onChange(result.displayName);
      }
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
      
      {isLoading && (
        <div className="absolute z-10 bg-white shadow rounded w-full text-black p-2 text-center text-gray-500">
          Searching...
        </div>
      )}
      
      {term && isOpen && results.length > 0 && (
        <div className="absolute z-10 bg-white shadow rounded w-full text-black max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.id}`}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelect(result)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {result.displayName}
                  </div>
                  {result.type === 'vehicle' && result.clientName && (
                    <div className="text-sm text-gray-600">
                      Client: {result.clientName}
                    </div>
                  )}
                  {result.type === 'client' && result.email && (
                    <div className="text-sm text-gray-600">
                      {result.email}
                    </div>
                  )}
                </div>
                <div className="ml-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    result.type === 'client' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {result.type === 'client' ? 'Client' : 'Vehicle'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Client option */}
          <Link 
            href="/office/clients/new" 
            className="block px-3 py-2 hover:bg-gray-100 border-t border-gray-200 text-blue-600 font-medium"
          >
            + Add New Client
          </Link>
        </div>
      )}
    </div>
  );
} 