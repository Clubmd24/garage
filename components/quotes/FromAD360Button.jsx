import React, { useState, useEffect } from 'react';

export default function FromAD360Button({ 
  vehicleId, 
  tenantId = 1, // Default tenant ID - should be passed from parent
  onItemsLoaded, 
  onError 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workflowStep, setWorkflowStep] = useState('');
  const [departments, setDepartments] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
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

      // Start with vehicle search to get variants
      setWorkflowStep('Searching for vehicle variants...');
      const response = await fetch('/api/integrations/ad360/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'search_vehicle',
          vehicleId: vehicleId,
          tenantId: tenantId,
          supplierId: 7, // AD360 supplier ID
          vin: vehicle.vin_number,
          reg: vehicle.licence_plate
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

      // Handle the workflow result
      if (data.status === 'success') {
        if (data.action === 'search_vehicle') {
          // Vehicle search completed, show variant selection
          if (data.variants && data.variants.length > 0) {
            setVehicleVariants(data.variants);
            setShowVariantSelection(true);
            setWorkflowStep(`Found ${data.variants.length} vehicle variants. Please select the correct one.`);
          } else {
            // No variants found, continue with workflow
            setWorkflowStep('No variants found, continuing with workflow...');
            await continueWorkflow(vehicle);
          }
          setIsLoading(false);
        } else if (data.action === 'select_distributor') {
          // Continue with next steps
          setWorkflowStep('Distributor selected, continuing workflow...');
          await continueWorkflow(vehicle);
        }
      } else {
        throw new Error('Workflow failed with unknown status');
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
      // Step 5: Get parts departments
      setWorkflowStep('Loading parts departments...');
      const departmentsResponse = await fetch('/api/integrations/ad360/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          supplierId: 7,
          action: 'get_parts_departments',
          variantId: variant.id
        })
      });

      if (!departmentsResponse.ok) {
        throw new Error('Failed to get parts departments');
      }

      const departmentsData = await departmentsResponse.json();
      setDepartments(departmentsData.departments);
      setWorkflowStep('Parts departments loaded. Select a department to view parts.');
      setTimeout(() => {
        setAd360Mode(true);
      }, 500);

    } catch (error) {
      console.error('Continue workflow error:', error);
      setError('Failed to continue AD360 workflow. Please try again.');
    }
  };

  const loadDepartmentParts = async (department) => {
    if (!department) return;

    setIsLoading(true);
    setError(null);
    setWorkflowStep(`Loading parts from ${department} department...`);

    try {
      const response = await fetch('/api/integrations/ad360/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          supplierId: 7,
          action: 'get_department_parts',
          department
        })
      });

      if (!response.ok) {
        throw new Error('Failed to load department parts');
      }

      const data = await response.json();
      setItems(data.parts);
      setSelectedDepartment(department);
      
      // Extract manufacturers from the loaded parts
      if (data.manufacturers && data.manufacturers.length > 0) {
        setManufacturers(data.manufacturers);
        setSelectedManufacturers(data.manufacturers); // Start with all manufacturers selected
        setShowManufacturerFilter(true);
      }
      
      setWorkflowStep(`Loaded ${data.parts.length} parts from ${department} department`);
      
      // Notify parent component with the loaded parts
      if (onItemsLoaded) {
        console.log('Calling onItemsLoaded with parts:', data.parts);
        onItemsLoaded(data.parts);
      }
      
      // If we have parts, show a success message
      if (data.parts.length > 0) {
        console.log('Successfully loaded parts:', data.parts.length);
        setWorkflowStep(`Successfully loaded ${data.parts.length} parts from ${department} department. Parts are now available in the dropdown below.`);
      } else {
        setWorkflowStep(`No parts found in ${department} department. Try selecting a different department.`);
      }

    } catch (error) {
      console.error('Department parts error:', error);
      setError('Failed to load department parts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (ad360Mode && departments.length > 0) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold !text-blue-900 mb-3" style={{color: '#1E3A8A'}}>Select AD360 Department</h3>
        <p className="text-sm !text-blue-700 mb-4" style={{color: '#1D4ED8'}}>
          {workflowStep || `Found ${departments.length} departments. Please select one to view parts.`}
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => handleDepartmentSelect(dept.id)}
              disabled={isLoading}
              className="p-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors text-left"
            >
              <div className="font-medium !text-blue-900" style={{color: '#1E3A8A'}}>{dept.name}</div>
              <div className="text-xs !text-blue-600 mt-1" style={{color: '#2563EB'}}>{dept.description}</div>
              <div className="text-xs !text-blue-500 mt-1" style={{color: '#3B82F6'}}>{dept.partCount || 'Multiple'} parts available</div>
            </button>
          ))}
        </div>
        
        {isLoading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 !text-blue-700 rounded-lg" style={{color: '#1D4ED8'}}>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 !text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{color: '#3B82F6'}}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading parts...
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show manufacturer filter when parts are loaded
  if (ad360Mode && showManufacturerFilter && manufacturers.length > 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium !text-green-800" style={{color: '#166534'}}>
            AD360 Parts Loaded - Filter by Manufacturer
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

        {/* Manufacturer Filter */}
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
            Available Parts ({items.filter(item => selectedManufacturers.length === 0 || selectedManufacturers.includes(item.brand || item.manufacturer)).length})
          </h4>
          <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
            {items
              .filter(item => selectedManufacturers.length === 0 || selectedManufacturers.includes(item.brand || item.manufacturer))
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
                  {variant.description && (
                    <div className="text-xs !text-gray-500 mt-1" style={{color: '#6B7280'}}>
                      {variant.description}
                    </div>
                  )}
                </div>
                <div className="text-right text-sm !text-gray-600" style={{color: '#4B5563'}}>
                  <div>{variant.power}</div>
                  <div>{variant.displacement}</div>
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