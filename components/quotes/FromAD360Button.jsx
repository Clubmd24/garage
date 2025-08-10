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

  const handleAD360Click = async () => {
    if (!vehicleId) {
      setError('Please select a vehicle first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/integrations/ad360/fetch-for-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          supplierId: 7, // AD360 supplier ID
          vehicleId
        })
      });

      if (response.status === 409) {
        const data = await response.json();
        setError(data.message || 'AD360 session expired. Please re-link in Suppliers.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch from AD360');
      }

      const data = await response.json();
      setItems(data.items);
      setAd360Mode(true);
      
      // Notify parent component
      if (onItemsLoaded) {
        onItemsLoaded(data.items);
      }

    } catch (error) {
      console.error('AD360 fetch error:', error);
      setError('Failed to fetch from AD360. Please try again.');
      if (onError) {
        onError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    handleAD360Click();
  };

  const handleItemSelect = (item) => {
    // This will be handled by the parent component through onItemsLoaded
    // The parent should update the form fields with the selected item data
  };

  if (ad360Mode && items.length > 0) {
    return (
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-green-800">
            AD360 Mode - {items.length} parts available
          </span>
          <button
            onClick={handleRefresh}
            className="text-green-600 hover:text-green-800 text-sm"
            title="Refresh AD360 data"
          >
            🔄 Refresh
          </button>
        </div>
        <p className="text-xs text-green-600">
          Parts from AD360 are now loaded. Select items from the dropdown below.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={handleAD360Click}
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
            Fetching from AD360...
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