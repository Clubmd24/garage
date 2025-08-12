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

      // Execute complete AD360 workflow in one call
      setWorkflowStep('Executing AD360 workflow...');
      const response = await fetch('/api/integrations/ad360/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete_workflow',
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
        if (data.action === 'complete_workflow') {
          // Workflow completed, parts should be available
          setWorkflowStep(`AD360 workflow completed! Found ${data.partsCount || 0} parts.`);
          
          // Use the parts data from the API response
          if (data.parts && data.parts.length > 0) {
            console.log('AD360 parts received from API:', data.parts);
            
            // Call the onItemsLoaded callback to populate the quote
            if (onItemsLoaded) {
              console.log('Calling onItemsLoaded with AD360 parts data');
              onItemsLoaded(data.parts);
            }
            
            setWorkflowStep(`✅ Successfully loaded ${data.parts.length} parts from AD360!`);
          } else {
            setWorkflowStep('AD360 workflow completed but no parts found.');
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

  if (ad360Mode && departments.length > 0) {
    return (
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-green-800">
            AD360 Mode - Select Parts Department
          </span>
          <button
            onClick={handleRefresh}
            className="text-green-600 hover:text-green-800 text-sm"
            title="Refresh AD360 workflow"
          >
            🔄 Refresh
          </button>
        </div>
        
        {workflowStep && (
          <p className="text-xs text-green-600 mb-3">
            {workflowStep}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 mb-3">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => loadDepartmentParts(dept.name)}
              disabled={isLoading}
              style={{
                color: selectedDepartment === dept.name ? '#1e40af' : '#1f2937',
                backgroundColor: selectedDepartment === dept.name ? '#dbeafe' : '#ffffff',
                borderColor: selectedDepartment === dept.name ? '#60a5fa' : '#d1d5db'
              }}
              className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 font-medium ${
                selectedDepartment === dept.name
                  ? 'shadow-md'
                  : 'hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
              } ${dept.highlighted ? 'ring-2 ring-yellow-400 ring-offset-1' : ''} ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="font-semibold text-center" style={{ color: 'inherit' }}>
                {dept.name}
              </div>
              {dept.highlighted && (
                <div className="text-xs text-yellow-700 mt-1 font-medium">Featured</div>
              )}
            </button>
          ))}
        </div>

        {/* Manufacturer Filter */}
        {showManufacturerFilter && manufacturers.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                Filter by Manufacturer ({selectedManufacturers.length} of {manufacturers.length})
              </span>
              <button
                onClick={() => setShowManufacturerFilter(false)}
                className="text-blue-600 hover:text-blue-800 text-sm"
                title="Hide manufacturer filter"
              >
                ✕ Hide
              </button>
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
                  <span className="text-gray-700">{manufacturer}</span>
                </label>
              ))}
            </div>
            
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setSelectedManufacturers(manufacturers)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedManufacturers([])}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear All
              </button>
            </div>
          </div>
        )}



        {items.length > 0 && (
          <div className="mt-3 p-2 bg-white border border-gray-200 rounded">
            <p className="text-xs text-gray-600 mb-2">
              {items.length} parts available from {selectedDepartment}
              {selectedManufacturers.length > 0 && (
                <span className="ml-2 text-blue-600">
                  (Filtered by {selectedManufacturers.length} manufacturers)
                </span>
              )}
            </p>
            <div className="text-xs text-gray-500">
              Parts are now loaded. Use the dropdown below to select items.
            </div>
            
            {/* Parts Display - Simplified */}
            <div className="mt-2">
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {items
                  .filter(item => selectedManufacturers.length === 0 || selectedManufacturers.includes(item.brand))
                  .slice(0, 20) // Show first 20 parts instead of complex pagination
                  .map((item, index) => (
                  <div key={index} className="text-xs text-gray-700 p-1 bg-gray-50 rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <strong>{item.partNumber}</strong> - {item.description}
                        {item.brand && <span className="text-gray-500 ml-2">({item.brand})</span>}
                      </div>
                      <div className="text-right">
                        {item.price && (
                          <span className="text-green-600 font-semibold">
                            €{typeof item.price === 'object' ? item.price.amount : item.price}
                          </span>
                        )}
                        {item.stock && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.stock}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {items.filter(item => selectedManufacturers.length === 0 || selectedManufacturers.includes(item.brand)).length > 20 && (
                <div className="mt-2 text-center">
                  <span className="text-xs text-gray-500">
                    Showing first 20 of {items.filter(item => selectedManufacturers.length === 0 || selectedManufacturers.includes(item.brand)).length} parts
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vehicle variant selection UI
  if (showVariantSelection && vehicleVariants.length > 0) {
    return (
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-800">
            AD360 - Select Vehicle Variant
          </span>
          <button
            onClick={() => {
              setShowVariantSelection(false);
              setVehicleVariants([]);
              setWorkflowStep('');
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="Cancel variant selection"
          >
            ✕ Cancel
          </button>
        </div>
        
        <p className="text-xs text-blue-600 mb-3">
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
                  <div className="font-semibold text-gray-900">
                    {variant.make} {variant.model}
                  </div>
                  <div className="text-sm text-gray-600">
                    {variant.version} • {variant.engine} • {variant.years}
                  </div>
                  {variant.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {variant.description}
                    </div>
                  )}
                </div>
                <div className="text-right text-sm text-gray-600">
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
        <p className="text-sm text-blue-700 mb-2">
          <strong>Step 1:</strong> Click the button below to start AD360 parts lookup
        </p>
        <p className="text-xs text-blue-600">
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
        {isLoading ? 'Loading...' : '🔍 From AD360'}
      </button>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}
      
      {!vehicleId && (
        <div className="mt-2 text-sm text-gray-500">
          Select a vehicle first to enable AD360 lookup
        </div>
      )}
    </div>
  );
} 