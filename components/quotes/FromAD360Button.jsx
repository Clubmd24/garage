import React, { useState, useEffect } from 'react';

export default function FromAD360Button({ 
  vehicleId, 
  tenantId = 1, // Default tenant ID - should be passed from parent
  onItemsLoaded, 
  onError,
  ad360Items = [] // Receive AD360 items from parent
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workflowStep, setWorkflowStep] = useState('');
  // Removed unused state variables for departments
  const [ad360Mode, setAd360Mode] = useState(false);
  
  // New state for vehicle variant selection
  const [vehicleVariants, setVehicleVariants] = useState([]);
  const [showVariantSelection, setShowVariantSelection] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  // New state for manufacturer filtering
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);
  const [showManufacturerFilter, setShowManufacturerFilter] = useState(false);

  const executeAD360Workflow = async () => {
    console.log('=== executeAD360Workflow START ===');
    console.log('Function called with vehicleId:', vehicleId);
    console.log('Function called with tenantId:', tenantId);

    if (!vehicleId) {
      console.log('No vehicleId, setting error and returning');
      setError('Please select a vehicle first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setWorkflowStep('Starting AD360 workflow...');

    try {
      // Get vehicle info first
      const vehicleResponse = await fetch(`/api/vehicles/${vehicleId}`);
      if (!vehicleResponse.ok) {
        throw new Error('Failed to get vehicle information');
      }
      const vehicle = await vehicleResponse.json();
      
      console.log('Vehicle data for AD360:', vehicle);

      // Start with vehicle search to get variants from AD360
      setWorkflowStep('Searching for vehicle variants in AD360...');
      const response = await fetch('/api/integrations/ad360/vehicle-variants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: vehicleId,
          tenantId: tenantId,
          supplierId: 7, // AD360 supplier ID
        })
      });

      console.log('AD360 workflow response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AD360 workflow failed:', response.status, errorText);
        setError(`AD360 workflow failed: ${response.status} - ${errorText}`);
        setWorkflowStep('Workflow failed - check console for details');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log('AD360 workflow response data:', data);

      if (data.error) {
        console.error('AD360 workflow error:', data.error);
        setError(`AD360 workflow error: ${data.error}`);
        setWorkflowStep('Workflow error - check console for details');
        setIsLoading(false);
        return;
      }

      // Handle the vehicle variants response
      if (data.variants && data.variants.length > 0) {
        // Vehicle variants found, show selection
        setVehicleVariants(data.variants);
        setShowVariantSelection(true);
        setWorkflowStep(`Found ${data.variants.length} vehicle variants in AD360. Please select the correct one.`);
        setIsLoading(false);
      } else {
        // No variants found, show error
        setError('No vehicle variants found in AD360 for this license plate');
        setWorkflowStep('No variants found - check license plate or try again');
        setIsLoading(false);
      }

    } catch (error) {
      console.error('AD360 workflow error:', error);
      setError('Failed to execute AD360 workflow. Please try again.');
      if (onError) {
        onError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const continueWorkflow = async (vehicle) => {
    try {
      // Continue with the remaining workflow steps
      setWorkflowStep('Navigating to REPLACEMENT tab...');
      
      const tabResponse = await fetch('/api/integrations/ad360/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'continue_workflow',
          tenantId,
          supplierId: 7,
          action: 'navigate_tab',
          vehicleId: vehicleId
        })
      });

      if (!tabResponse.ok) {
        throw new Error('Failed to navigate to REPLACEMENT tab');
      }

      setWorkflowStep('Searching for vehicle...');
      
      const searchResponse = await fetch('/api/integrations/ad360/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'continue_workflow',
          tenantId,
          supplierId: 7,
          action: 'search_vehicle',
          vehicleId: vehicleId,
          vin: vehicle.vin_number,
          reg: vehicle.licence_plate
        })
      });

      if (!searchResponse.ok) {
        throw new Error('Failed to search for vehicle');
      }

      const searchData = await searchResponse.json();
      
      if (searchData.variants && searchData.variants.length > 0) {
        // Auto-select first variant for now
        setSelectedVariant(searchData.variants[0]);
        await continueWithSelectedVariant(searchData.variants[0]);
      } else {
        throw new Error('No vehicle variants found');
      }

    } catch (error) {
      console.error('Continue workflow error:', error);
      setError('Failed to continue AD360 workflow');
    }
  };

  const continueWithSelectedVariant = async (variant) => {
    if (!variant) return;

    try {
      // Now that we have the selected variant, fetch parts for this vehicle
      setWorkflowStep('Fetching parts for selected vehicle variant...');
      
      // Call the fetch-for-vehicle API to get parts
      const partsResponse = await fetch('/api/integrations/ad360/fetch-for-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          supplierId: 7,
          vehicleId: vehicleId
        })
      });

      if (!partsResponse.ok) {
        throw new Error('Failed to fetch parts for selected variant');
      }

      const partsData = await partsResponse.json();
      
      if (partsData.items && partsData.items.length > 0) {
        // Parts loaded successfully
        setWorkflowStep(`Successfully loaded ${partsData.items.length} parts for ${variant.make} ${variant.model} ${variant.version}`);
        
        // Notify parent component with the loaded parts
        if (onItemsLoaded) {
          console.log('Calling onItemsLoaded with parts:', partsData.items);
          onItemsLoaded(partsData.items);
        }
        
        // Set AD360 mode to show parts
        setAd360Mode(true);
      } else {
        setWorkflowStep('No parts found for this vehicle variant. Please try a different variant or check the vehicle details.');
      }

    } catch (error) {
      console.error('Continue workflow error:', error);
      setError('Failed to fetch parts for selected variant. Please try again.');
    }
  };

  // Department selection is no longer needed since we fetch all parts directly
  // after variant selection

  const handleRefresh = () => {
    executeAD360Workflow();
  };

  const generateMockParts = (vehicle) => {
    // Generate realistic mock parts based on the vehicle
    const parts = [
      {
        id: 'part-1',
        partNumber: 'AD360-001',
        description: 'Brake Pads - Front',
        price: { amount: 45.99, currency: 'EUR' },
        manufacturer: 'AD360',
        category: 'Brakes',
        compatibility: vehicle.make + ' ' + vehicle.model
      },
      {
        id: 'part-2', 
        partNumber: 'AD360-002',
        description: 'Oil Filter',
        price: { amount: 12.50, currency: 'EUR' },
        manufacturer: 'AD360',
        category: 'Engine',
        compatibility: vehicle.make + ' ' + vehicle.model
      },
      {
        id: 'part-3',
        partNumber: 'AD360-003', 
        description: 'Air Filter',
        price: { amount: 18.75, currency: 'EUR' },
        manufacturer: 'AD360',
        category: 'Engine',
        compatibility: vehicle.make + ' ' + vehicle.model
      }
    ];
    
    console.log('Generated mock parts:', parts);
    return parts;
  };

  const handleDepartmentSelect = async (departmentId) => {
    try {
      setWorkflowStep(`Loading parts for ${departmentId} department...`);
      setIsLoading(true);
      
      const response = await fetch('/api/integrations/ad360/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_department_parts',
          departmentId: departmentId,
          tenantId: tenantId,
          supplierId: 7,
          vehicleId: vehicleId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to load department parts');
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.parts) {
        console.log(`Loaded ${data.parts.length} parts for ${departmentId}:`, data.parts);
        
        // Set manufacturers for filtering
        if (data.manufacturers && data.manufacturers.length > 0) {
          setManufacturers(data.manufacturers);
          setSelectedManufacturers(data.manufacturers); // Start with all selected
        }
        
        // Call the onItemsLoaded callback to populate the quote
        if (onItemsLoaded) {
          onItemsLoaded(data.parts);
        }
        
        setWorkflowStep(`✅ Successfully loaded ${data.parts.length} parts from ${departmentId} department!`);
        setDepartments([]); // Hide department selection
        setShowManufacturerFilter(true); // Show manufacturer filter
      } else {
        throw new Error('No parts data received');
      }
      
    } catch (error) {
      console.error('Department selection error:', error);
      setError(`Failed to load parts for ${departmentId}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Department selection removed - we now fetch all parts directly after variant selection

  // Show parts list when AD360 items are available
  if (ad360Mode && ad360Items && ad360Items.length > 0) {
    // Extract manufacturers from items if not already set
    if (manufacturers.length === 0) {
      const uniqueManufacturers = [...new Set(ad360Items.map(item => item.brand || item.manufacturer).filter(Boolean))];
      setManufacturers(uniqueManufacturers);
      setSelectedManufacturers(uniqueManufacturers); // Start with all selected
    }
    
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium !text-green-800" style={{color: '#166534'}}>
            AD360 Parts Loaded - {ad360Items.length} Parts Available
          </span>
          <button
            onClick={() => setShowManufacturerFilter(false)}
            className="!text-green-600 hover:!text-green-800 text-sm"
            title="Hide manufacturer filter"
          >
            ✕ Hide
          </button>
        </div>
        
        {workflowStep && (
          <p className="text-xs !text-green-600 mb-3" style={{color: '#059669'}}>
            {workflowStep}
          </p>
        )}

        {/* Manufacturer Filter - Only show when manufacturers are available */}
        {manufacturers.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium !text-blue-800" style={{color: '#1E40AF'}}>
              Filter by Manufacturer ({selectedManufacturers.length} of {manufacturers.length})
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
            {manufacturers.map((manufacturer) => (
              <label key={manufacturer} className="flex items-center space-x-2 text-xs">
                <input
                  type="checkbox"
                  checked={selectedManufacturers.includes(manufacturer)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedManufacturers([...selectedManufacturers, manufacturer]);
                    } else {
                      setSelectedManufacturers(selectedManufacturers.filter(m => m !== manufacturer));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="!text-gray-700" style={{color: '#374151'}}>{manufacturer}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setSelectedManufacturers(manufacturers)}
              className="text-xs !text-blue-600 hover:!text-blue-800 underline"
              style={{color: '#2563EB'}}
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedManufacturers([])}
              className="text-xs !text-blue-600 hover:!text-blue-800 underline"
              style={{color: '#2563EB'}}
            >
              Clear All
            </button>
          </div>
        </div>
        )}

        <div className="mt-3 p-2 bg-white border border-gray-200 rounded">
          <p className="text-xs !text-gray-600 mb-2" style={{color: '#4B5563'}}>
            Parts are now loaded and filtered. Use the dropdown below to select items.
          </p>
          <div className="text-xs !text-gray-500" style={{color: '#6B7280'}}>
            {selectedManufacturers.length > 0 && (
              <span className="!text-blue-600" style={{color: '#2563EB'}}>
                Showing parts from {selectedManufacturers.length} manufacturers
              </span>
            )}
          </div>
        </div>
        
        {/* Parts List Display */}
        <div className="mt-4">
          <h4 className="text-sm font-medium !text-gray-800 mb-3" style={{color: '#1F2937'}}>
            Available Parts ({ad360Items ? ad360Items.length : 0})
          </h4>
          {/* Debug info */}
          <div className="text-xs !text-gray-500 mb-2" style={{color: '#6B7280'}}>
            Debug: {ad360Items ? ad360Items.length : 0} items, {manufacturers.length} manufacturers, {selectedManufacturers.length} selected
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
            {ad360Items && ad360Items
              .map((item, index) => (
                <div 
                  key={item.id || index}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (onItemsLoaded) {
                      onItemsLoaded([item]);
                    }
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs !text-gray-500 font-mono" style={{color: '#6B7280'}}>
                          {item.manufacturer?.substring(0, 2) || 'AD'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono !text-blue-600 bg-blue-50 px-2 py-1 rounded" style={{color: '#2563EB'}}>
                            {item.partNumber}
                          </span>
                          <span className="text-xs !text-gray-500" style={{color: '#6B7280'}}>
                            {item.brand || item.manufacturer}
                          </span>
                        </div>
                        <p className="text-sm !text-gray-800 mt-1" style={{color: '#1F2937'}}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold !text-green-600" style={{color: '#059669'}}>
                      €{item.price?.amount || item.price || '0.00'}
                    </div>
                    <div className="text-xs !text-gray-500" style={{color: '#6B7280'}}>
                      {item.category}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Vehicle variant selection UI
  if (showVariantSelection && vehicleVariants.length > 0) {
    return (
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium !text-blue-800" style={{color: '#1E40AF'}}>
            AD360 - Select Vehicle Variant
          </span>
          <button
            onClick={() => {
              setShowVariantSelection(false);
              setVehicleVariants([]);
              setWorkflowStep('');
            }}
            className="!text-blue-600 hover:!text-blue-800 text-sm"
            title="Cancel variant selection"
          >
            ✕ Cancel
          </button>
        </div>
        
        <p className="text-xs !text-blue-600 mb-3" style={{color: '#2563EB'}}>
          Multiple vehicle variants found. Please select the correct one to continue.
        </p>

        <div className="space-y-2">
          {vehicleVariants.map((variant, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedVariant(variant);
                setShowVariantSelection(false);
                setTimeout(() => {
                  continueWithSelectedVariant(variant);
                }, 100);
              }}
              className="w-full p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold !text-gray-900" style={{color: '#111827'}}>
                    {variant.make} {variant.model}
                  </div>
                  <div className="text-sm !text-gray-600" style={{color: '#4B5563'}}>
                    {variant.version} • {variant.engine} • {variant.years}
                  </div>
                </div>
                <div className="text-right text-sm !text-gray-600" style={{color: '#4B7280'}}>
                  <div>{variant.power}</div>
                  <div>{variant.kw}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm !text-blue-700 mb-2" style={{color: '#1D4ED8'}}>
          <strong>Step 1:</strong> Click the button below to start AD360 parts lookup
        </p>
        <p className="text-xs !text-blue-600" style={{color: '#2563EB'}}>
          This will search AD360 for parts compatible with your selected vehicle
        </p>
      </div>
      
      <button
        type="button"
        onClick={() => {
          console.log('🔍 From AD360 button clicked!');
          console.log('Button click event fired');
          console.log('Vehicle ID:', vehicleId);
          console.log('Tenant ID:', tenantId);
          console.log('About to call executeAD360Workflow...');
          
          try {
            executeAD360Workflow();
            console.log('executeAD360Workflow called successfully');
          } catch (error) {
            console.error('Error calling executeAD360Workflow:', error);
          }
        }}
        disabled={isLoading || !vehicleId}
        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
          isLoading || !vehicleId
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700'
        }`}
      >
        {isLoading ? 'Loading...' : '�� From AD360'}
      </button>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm !text-red-700" style={{color: '#B91C1C'}}>
          {error}
        </div>
      )}
      
      {!vehicleId && (
        <div className="mt-2 text-sm !text-gray-500" style={{color: '#6B7280'}}>
          Select a vehicle first to enable AD360 lookup
        </div>
      )}
    </div>
  );
} 