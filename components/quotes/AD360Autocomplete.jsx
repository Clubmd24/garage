import React, { useState, useEffect, useRef } from 'react';

export default function AD360Autocomplete({ 
  value, 
  onChange, 
  onSelect, 
  items = [], // Changed from preloadedParts to items for consistency
  placeholder = "Search AD360 parts...",
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
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

  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
      return;
    }

    const searchTerm = searchQuery.toLowerCase().trim();
    const filtered = items.filter(item => 
      (item.partNumber && item.partNumber.toLowerCase().includes(searchTerm)) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm)) ||
      (item.description && item.description.toLowerCase().includes(searchTerm))
    );
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue);
  };

  const handleItemSelect = (item) => {
    // AD360 internal reference number maps to our part_number field
    const partNumber = item.partNumber || item.internalReference || '';
    setSearchQuery(partNumber);
    onChange(partNumber);
    onSelect(item);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (items.length > 0) {
      setIsOpen(true);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (typeof price === 'object' && price.amount) {
      return `€${price.amount.toFixed(2)}`;
    }
    if (typeof price === 'number') {
      return `€${price.toFixed(2)}`;
    }
    return 'N/A';
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
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 z-10">
          {error}
        </div>
      )}

      {isOpen && filteredItems.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
          {filteredItems.map((item, index) => (
            <div
              key={index}
              onClick={() => handleItemSelect(item)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {item.partNumber || item.internalReference || 'No Part Number'}
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

      {isOpen && filteredItems.length === 0 && searchQuery.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500 z-10">
          No parts found matching "{searchQuery}"
        </div>
      )}

      {isOpen && items.length === 0 && !searchQuery.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500 z-10">
          No AD360 parts loaded. Please use the "From AD360" button first.
        </div>
      )}
    </div>
  );
} 