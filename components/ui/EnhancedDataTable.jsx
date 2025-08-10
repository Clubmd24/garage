import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

const EnhancedDataTable = React.forwardRef(({ 
  className,
  columns = [],
  data = [],
  loading = false,
  pagination = false,
  searchable = false,
  sortable = false,
  selectable = false,
  onRowClick,
  onSelectionChange,
  variant = 'default',
  ...props 
}, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-glass-bg border-glass-border shadow-glass-shadow';
      case 'elevated':
        return 'bg-surface-elevated border-border-accent shadow-xl';
      default:
        return 'bg-surface-primary border-border-primary';
    }
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row => 
      columns.some(column => {
        const value = row[column.key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, columns, searchTerm]);

  // Sort data based on sort configuration
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination, currentPage, itemsPerPage]);

  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return;
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle row selection
  const handleRowSelection = (rowId) => {
    if (!selectable) return;
    
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(Array.from(newSelection));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (!selectable) return;
    
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = paginatedData.map(row => row.id || row.key);
      setSelectedRows(new Set(allIds));
      onSelectionChange?.(allIds);
    }
  };

  // Render sort indicator
  const renderSortIndicator = (columnKey) => {
    if (!sortable || sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d={sortConfig.direction === 'asc' 
            ? "M5 15l7-7 7 7" 
            : "M19 9l-7 7-7-7"
          } 
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className={cn("data-table animate-pulse", getVariantClasses(), className)} {...props}>
        <div className="p-6">
          <div className="h-8 bg-surface-secondary rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-surface-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("data-table", getVariantClasses(), className)} {...props}>
      {/* Search and Controls */}
      {(searchable || selectable) && (
        <div className="p-4 border-b border-border-primary/50 bg-surface-secondary/30">
          <div className="flex items-center justify-between gap-4">
            {searchable && (
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-surface-primary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            )}
            
            {selectable && selectedRows.size > 0 && (
              <div className="text-sm text-text-secondary">
                {selectedRows.size} item{selectedRows.size !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-secondary/50 border-b border-border-primary">
              {selectable && (
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary bg-surface-primary border-border-primary rounded focus:ring-primary focus:ring-2"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-4 text-left text-sm font-semibold text-text-secondary uppercase tracking-wider",
                    sortable && "cursor-pointer hover:text-text-primary transition-colors duration-200",
                    column.className
                  )}
                  onClick={() => sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {sortable && renderSortIndicator(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={cn(
                  "data-table-row group cursor-pointer",
                  selectedRows.has(row.id || row.key) && "bg-primary/5 border-primary/20"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id || row.key)}
                      onChange={() => handleRowSelection(row.id || row.key)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-primary bg-surface-primary border-border-primary rounded focus:ring-primary focus:ring-2"
                    />
                  </td>
                )}
                
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "data-table-cell",
                      column.className
                    )}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-border-primary/50 bg-surface-secondary/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-surface-primary border border-border-primary rounded-lg text-text-primary hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-text-secondary">
                Page {currentPage} of {Math.ceil(sortedData.length / itemsPerPage)}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(sortedData.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(sortedData.length / itemsPerPage)}
                className="px-3 py-2 text-sm bg-surface-primary border border-border-primary rounded-lg text-text-primary hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

EnhancedDataTable.displayName = 'EnhancedDataTable';

// Column definition helper
export function createColumn(key, label, options = {}) {
  return {
    key,
    label,
    render: options.render,
    className: options.className,
    sortable: options.sortable !== false,
    ...options
  };
}

// Common column renderers
export const columnRenderers = {
  status: (value) => (
    <span className={cn(
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
      value === 'active' && "bg-success/10 text-success border border-success/20",
      value === 'inactive' && "bg-error/10 text-error border border-error/20",
      value === 'pending' && "bg-warning/10 text-warning border border-warning/20"
    )}>
      {value}
    </span>
  ),
  
  date: (value) => (
    <span className="text-text-secondary">
      {new Date(value).toLocaleDateString()}
    </span>
  ),
  
  currency: (value) => (
    <span className="font-medium">
      ${parseFloat(value).toFixed(2)}
    </span>
  ),
  
  percentage: (value) => (
    <span className={cn(
      "font-medium",
      parseFloat(value) >= 0 ? "text-success" : "text-error"
    )}>
      {parseFloat(value) >= 0 ? '+' : ''}{value}%
    </span>
  ),
  
  actions: (value, row) => (
    <div className="flex items-center gap-2">
      <button className="p-1 text-text-muted hover:text-primary transition-colors duration-200">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button className="p-1 text-text-muted hover:text-error transition-colors duration-200">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
};

export default EnhancedDataTable; 