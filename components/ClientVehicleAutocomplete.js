import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientVehicleAutocomplete({ 
  value, 
  onChange, 
  onSelect,
  mode = 'client', // 'client' or 'fleet'
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
    if (!term || term.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    let cancel = false;

    // Search based on mode
    let searchPromises = [];
    
    if (mode === 'client') {
      // In client mode, search for clients and vehicles
      searchPromises = [
        fetch(`/api/clients?q=${encodeURIComponent(term)}`).then(r => r.ok ? r.json() : []),
        fetch(`/api/vehicles?q=${encodeURIComponent(term)}`).then(r => r.ok ? r.json() : [])
      ];
    } else {
      // In fleet mode, search for fleets and vehicles
      searchPromises = [
        fetch(`/api/fleets?q=${encodeURIComponent(term)}`).then(r => r.ok ? r.json() : []),
        fetch(`/api/vehicles?q=${encodeURIComponent(term)}`).then(r => r.ok ? r.json() : [])
      ];
    }
    
    Promise.all(searchPromises)
      .then(([entities, vehicles]) => {
        if (cancel) return;
        
        // Combine and format results with smart grouping
        const combinedResults = [];
        const processedClients = new Set();
        const processedVehicles = new Set();
        
        if (mode === 'client') {
          // Process clients first and find their vehicles
          entities.forEach(client => {
            const clientId = client.id;
            const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
            processedClients.add(clientId);
            
            // Find vehicles for this client
            const clientVehicles = vehicles.filter(v => v.customer_id === clientId);
            
            if (clientVehicles.length > 0) {
              // Create combined client+vehicle results
              clientVehicles.forEach(vehicle => {
                processedVehicles.add(vehicle.id);
                combinedResults.push({
                  type: 'client_vehicle',
                  id: `client_${clientId}_vehicle_${vehicle.id}`,
                  displayName: `${clientName} - ${vehicle.licence_plate || 'No Plate'} ${vehicle.make} ${vehicle.model}`,
                  clientName: clientName,
                  clientId: clientId,
                  vehicleId: vehicle.id,
                  vehicleDisplay: `${vehicle.licence_plate || 'No Plate'} - ${vehicle.make} ${vehicle.model} ${vehicle.year}`,
                  email: client.email,
                  phone: client.phone,
                  clientData: client,
                  vehicleData: vehicle
                });
              });
            } else {
              // Client with no vehicles - add as standalone client
              combinedResults.push({
                type: 'client',
                id: clientId,
                displayName: clientName,
                email: client.email,
                phone: client.phone,
                data: client
              });
            }
          });
          
          // Add remaining vehicles that don't belong to processed clients
          vehicles.forEach(vehicle => {
            if (!processedVehicles.has(vehicle.id)) {
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
            }
          });
        } else {
          // Fleet mode - similar logic but for fleets
          entities.forEach(fleet => {
            const fleetId = fleet.id;
            const fleetName = fleet.company_name;
            processedClients.add(fleetId);
            
            // Find vehicles for this fleet
            const fleetVehicles = vehicles.filter(v => v.fleet_id === fleetId);
            
            if (fleetVehicles.length > 0) {
              // Create combined fleet+vehicle results
              fleetVehicles.forEach(vehicle => {
                processedVehicles.add(vehicle.id);
                combinedResults.push({
                  type: 'fleet_vehicle',
                  id: `fleet_${fleetId}_vehicle_${vehicle.id}`,
                  displayName: `${fleetName} - ${vehicle.licence_plate || 'No Plate'} ${vehicle.make} ${vehicle.model}`,
                  fleetName: fleetName,
                  fleetId: fleetId,
                  vehicleId: vehicle.id,
                  vehicleDisplay: `${vehicle.licence_plate || 'No Plate'} - ${vehicle.make} ${vehicle.model} ${vehicle.year}`,
                  email: fleet.email_1 || fleet.email_2,
                  phone: fleet.contact_number_1 || fleet.contact_number_2,
                  fleetData: fleet,
                  vehicleData: vehicle
                });
              });
            } else {
              // Fleet with no vehicles - add as standalone fleet
              combinedResults.push({
                type: 'fleet',
                id: fleetId,
                displayName: fleetName,
                email: fleet.email_1 || fleet.email_2,
                phone: fleet.contact_number_1 || fleet.contact_number_2,
                data: fleet
              });
            }
          });
          
          // Add remaining vehicles that don't belong to processed fleets
          vehicles.forEach(vehicle => {
            if (!processedVehicles.has(vehicle.id)) {
              combinedResults.push({
                type: 'vehicle',
                id: vehicle.id,
                displayName: `${vehicle.licence_plate || 'No Plate'} - ${vehicle.make} ${vehicle.model} ${vehicle.year}`,
                clientId: vehicle.customer_id,
                fleetId: vehicle.fleet_id,
                data: vehicle
              });
            }
          });
        }
        
        // Sort results by relevance (exact matches first, then partial matches)
        combinedResults.sort((a, b) => {
          const aExact = a.displayName.toLowerCase().includes(term.toLowerCase());
          const bExact = b.displayName.toLowerCase().includes(term.toLowerCase());
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return a.displayName.localeCompare(b.displayName);
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
  }, [term, mode]);

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
                      : result.type === 'client_vehicle'
                      ? 'bg-indigo-100 text-indigo-800'
                      : result.type === 'fleet'
                      ? 'bg-purple-100 text-purple-800'
                      : result.type === 'fleet_vehicle'
                      ? 'bg-violet-100 text-violet-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {result.type === 'client' ? 'Client' : 
                     result.type === 'client_vehicle' ? 'Client+Vehicle' :
                     result.type === 'fleet' ? 'Fleet' : 
                     result.type === 'fleet_vehicle' ? 'Fleet+Vehicle' : 'Vehicle'}
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