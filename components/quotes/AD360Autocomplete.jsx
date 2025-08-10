import React, { useState, useEffect, useRef } from 'react';

export default function AD360Autocomplete({ 
  value, 
  onChange, 
  onSelect, 
  vehicleId, 
  tenantId = 1,
  placeholder = "Search AD360 parts...",
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query) => {
    if (!vehicleId || !query.trim()) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/integrations/ad360/search?tenantId=${tenantId}&supplierId=7&vehicleId=${vehicleId}&q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Failed to search AD360');
      }

      const data = await response.json();
      setItems(data.items || []);
      setIsOpen(true);

    } catch (error) {
      console.error('AD360 search error:', error);
      setError('Failed to search AD360');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue);
    
    // Debounce search
    clearTimeout(searchQuery.timeout);
    searchQuery.timeout = setTimeout(() => {
      handleSearch(newValue);
    }, 300);
  };

  const handleItemSelect = (item) => {
    setSearchQuery(item.partNumber || '');
    onChange(item.partNumber || '');
    onSelect(item);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && items.length > 0) {
      setIsOpen(true);
    }
  };

  const formatPrice = (price) => {
    if (!price || !price.amount) return 'N/A';
    return `${price.amount.toFixed(2)} ${price.currency || 'EUR'}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        disabled={disabled}
        className="input w-full"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 z-10">
          {error}
        </div>
      )}

      {isOpen && items.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => handleItemSelect(item)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {item.partNumber || 'No Part Number'}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {item.brand || 'Unknown Brand'}
                  </div>
                  <div className="text-sm text-gray-500 truncate mt-1">
                    {item.description || 'No description'}
                  </div>
                </div>
                <div className="ml-3 text-right">
                  <div className="text-sm font-medium text-green-600">
                    {formatPrice(item.price)}
                  </div>
                  {item.stock && (
                    <div className="text-xs text-gray-500">
                      Stock: {item.stock}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && items.length === 0 && !isLoading && searchQuery.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500 z-10">
          No parts found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
} 