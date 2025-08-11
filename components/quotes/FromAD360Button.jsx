import React, { useState, useEffect } from 'react';

export default function FromAD360Button({ 
  vehicleId, 
  tenantId = 1, // Default tenant ID - should be passed from parent
  onItemsLoaded, 
  onError 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [ad360Mode, setAd360Mode] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [workflowStep, setWorkflowStep] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const executeAD360Workflow = async () => {
    if (!vehicleId) {
      setError('Please select a vehicle first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setWorkflowStep('Starting AD360 workflow...');

    try {
      // Step 1: Select distributor
      setWorkflowStep('Selecting distributor (AD Vicente)...');
      const distributorResponse = await fetch('/api/integrations/ad360/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          supplierId: 7, // AD360 supplier ID
          action: 'select_distributor'
        })
      });

      if (!distributorResponse.ok) {
        throw new Error('Failed to select distributor');
      }

      // Step 2: Navigate to REPLACEMENT tab
      setWorkflowStep('Navigating to REPLACEMENT tab...');
      const tabResponse = await fetch('/api/integrations/ad360/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          supplierId: 7,
          action: 'navigate_tab'
        })
      });

      if (!tabResponse.ok) {
        throw new Error('Failed to navigate to REPLACEMENT tab');
      }

      // Step 3: Get vehicle info for search
      const vehicleResponse = await fetch(`/api/vehicles/${vehicleId}`);
      if (!vehicleResponse.ok) {
        throw new Error('Failed to get vehicle information');
      }
      const vehicle = await vehicleResponse.json();

      // Step 4: Search for vehicle
      setWorkflowStep('Searching for vehicle...');
      const searchResponse = await fetch('/api/integrations/ad360/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          supplierId: 7,
          action: 'search_vehicle',
          vin: vehicle.vin_number,
          reg: vehicle.licence_plate
        })
      });

      if (!searchResponse.ok) {
        throw new Error('Failed to search for vehicle');
      }

      // Step 5: Get parts departments
      setWorkflowStep('Loading parts departments...');
      const departmentsResponse = await fetch('/api/integrations/ad360/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          supplierId: 7,
          action: 'get_parts_departments'
        })
      });

      if (!departmentsResponse.ok) {
        throw new Error('Failed to get parts departments');
      }

      const departmentsData = await departmentsResponse.json();
      setDepartments(departmentsData.departments);
      setWorkflowStep('Parts departments loaded. Select a department to view parts.');

      // Set AD360 mode to show department selection
      setAd360Mode(true);

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
      setWorkflowStep(`Loaded ${data.parts.length} parts from ${department} department`);
      
      // Notify parent component with the loaded parts
      if (onItemsLoaded) {
        onItemsLoaded(data.parts);
      }

      // If we have parts, show a success message
      if (data.parts.length > 0) {
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

        {items.length > 0 && (
          <div className="mt-3 p-2 bg-white border border-gray-200 rounded">
            <p className="text-xs text-gray-600 mb-2">
              {items.length} parts available from {selectedDepartment}
            </p>
            <div className="text-xs text-gray-500">
              Parts are now loaded. Use the dropdown below to select items.
            </div>
            {/* Show first few parts as examples */}
            <div className="mt-2 space-y-1">
              {items.slice(0, 3).map((item, index) => (
                <div key={index} className="text-xs text-gray-700 p-1 bg-gray-50 rounded">
                  <strong>{item.partNumber}</strong> - {item.description} 
                  {item.price && <span className="text-green-600 ml-2">€{item.price.amount}</span>}
                </div>
              ))}
              {items.length > 3 && (
                <div className="text-xs text-gray-500 italic">
                  ... and {items.length - 3} more parts
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={executeAD360Workflow}
        disabled={isLoading || !vehicleId}
        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
          isLoading || !vehicleId
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {workflowStep || 'Executing AD360 workflow...'}
          </span>
        ) : (
          <span className="flex items-center">
            🔍 From AD360
          </span>
        )}
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