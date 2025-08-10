import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

// Table Header Component
const TableHeader = React.forwardRef(({
  children,
  className = '',
  sortable = false,
  sortDirection = null,
  onSort,
  ...props
}, ref) => {
  const handleSort = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  return (
    <th
      ref={ref}
      className={cn(
        'table-header',
        'px-4 py-3 text-left text-sm font-medium text-text-primary',
        'border-b border-border-primary bg-surface-secondary',
        'transition-colors duration-200',
        sortable && 'cursor-pointer hover:bg-surface-tertiary select-none',
        className
      )}
      onClick={handleSort}
      {...props}
    >
      <div className="flex items-center space-x-2">
        <span>{children}</span>
        {sortable && (
          <div className="flex flex-col">
            <svg
              className={cn(
                'w-3 h-3 transition-colors',
                sortDirection === 'asc' ? 'text-primary' : 'text-text-tertiary'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <svg
              className={cn(
                'w-3 h-3 -mt-1 transition-colors',
                sortDirection === 'desc' ? 'text-primary' : 'text-text-tertiary'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </th>
  );
});

// Table Cell Component
const TableCell = React.forwardRef(({
  children,
  className = '',
  align = 'left',
  ...props
}, ref) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <td
      ref={ref}
      className={cn(
        'table-cell',
        'px-4 py-3 text-sm text-text-secondary',
        'border-b border-border-primary/50',
        'transition-colors duration-200',
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
});

// Table Row Component
const TableRow = React.forwardRef(({
  children,
  className = '',
  selected = false,
  onClick,
  hoverable = true,
  ...props
}, ref) => {
  return (
    <tr
      ref={ref}
      className={cn(
        'table-row',
        'transition-all duration-200',
        hoverable && 'hover:bg-surface-secondary/50',
        selected && 'bg-primary/5 border-l-4 border-l-primary',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
});

// Table Filter Component
const TableFilter = ({
  filters = [],
  onFilterChange,
  className = ''
}) => {
  const [filterValues, setFilterValues] = useState({});

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setFilterValues({});
    onFilterChange?.({});
  };

  if (!filters.length) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-4 p-4 bg-surface-secondary border-b border-border-primary', className)}>
      {filters.map((filter) => (
        <div key={filter.key} className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-text-secondary">
            {filter.label}
          </label>
          {filter.type === 'select' ? (
            <select
              value={filterValues[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="px-3 py-1 text-sm border border-border-primary rounded-md bg-surface-primary text-text-primary focus:outline-none focus:border-border-accent"
            >
              <option value="">All</option>
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : filter.type === 'input' ? (
            <input
              type="text"
              placeholder={filter.placeholder || 'Filter...'}
              value={filterValues[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="px-3 py-1 text-sm border border-border-primary rounded-md bg-surface-primary text-text-primary focus:outline-none focus:border-border-accent"
            />
          ) : null}
        </div>
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={clearFilters}
        className="ml-auto text-xs"
      >
        Clear Filters
      </Button>
    </div>
  );
};

// Table Pagination Component
const TablePagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  className = ''
}) => {
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    if (page !== '...' && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 bg-surface-secondary border-t border-border-primary', className)}>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-text-secondary">
          Showing {startItem} to {endItem} of {totalItems} results
        </span>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm text-text-secondary">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange?.(parseInt(e.target.value))}
            className="px-2 py-1 text-sm border border-border-primary rounded-md bg-surface-primary text-text-primary focus:outline-none focus:border-border-accent"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        {pageNumbers.map((page, index) => (
          <Button
            key={index}
            variant={page === currentPage ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePageChange(page)}
            disabled={page === '...'}
            className="px-3 py-1 min-w-[40px]"
          >
            {page}
          </Button>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

// Enhanced Table Component
const EnhancedTable = React.forwardRef(({
  columns = [],
  data = [],
  sortable = true,
  filterable = true,
  pagination = true,
  selectable = false,
  onRowSelect,
  onSort,
  onFilter,
  className = '',
  emptyMessage = 'No data available',
  loading = false,
  ...props
}, ref) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Apply filters
  const filteredData = useMemo(() => {
    if (!Object.keys(filters).length) return data;
    
    return data.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const cellValue = row[key];
        if (typeof cellValue === 'string') {
          return cellValue.toLowerCase().includes(value.toLowerCase());
        }
        return cellValue === value;
      });
    });
  }, [data, filters]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage, pagination]);

  // Handle sorting
  const handleSort = useCallback((key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  }, [sortConfig, onSort]);

  // Handle filtering
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
    onFilter?.(newFilters);
  }, [onFilter]);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  // Handle row selection
  const handleRowSelect = useCallback((rowId) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(rowId)) {
      newSelectedRows.delete(rowId);
    } else {
      newSelectedRows.add(rowId);
    }
    setSelectedRows(newSelectedRows);
    onRowSelect?.(Array.from(newSelectedRows));
  }, [selectedRows, onRowSelect]);

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    } else {
      const allIds = paginatedData.map(row => row.id || row.key || row._id);
      setSelectedRows(new Set(allIds));
      onRowSelect?.(allIds);
    }
  }, [selectedRows.size, paginatedData, onRowSelect]);

  // Build filter configuration from columns
  const filterConfig = useMemo(() => {
    return columns
      .filter(col => col.filterable !== false)
      .map(col => ({
        key: col.key,
        label: col.label || col.key,
        type: col.filterType || 'input',
        options: col.filterOptions,
        placeholder: col.filterPlaceholder || `Filter ${col.label || col.key}...`
      }));
  }, [columns]);

  if (loading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="animate-pulse">
          <div className="h-10 bg-surface-secondary rounded-t-lg mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-surface-secondary mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full bg-surface-primary rounded-lg border border-border-primary overflow-hidden', className)}>
      {/* Filters */}
      {filterable && filterConfig.length > 0 && (
        <TableFilter
          filters={filterConfig}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table ref={ref} className="w-full" {...props}>
          <thead>
            <tr>
              {selectable && (
                <TableHeader className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary border-border-primary rounded focus:ring-primary focus:ring-2"
                  />
                </TableHeader>
              )}
              {columns.map((column) => (
                <TableHeader
                  key={column.key}
                  sortable={sortable && column.sortable !== false}
                  sortDirection={sortConfig.key === column.key ? sortConfig.direction : null}
                  onSort={() => handleSort(column.key)}
                  className={column.headerClassName}
                >
                  {column.label || column.key}
                </TableHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={row.id || row.key || row._id || rowIndex}
                  selected={selectedRows.has(row.id || row.key || row._id)}
                  hoverable={true}
                >
                  {selectable && (
                    <TableCell className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id || row.key || row._id)}
                        onChange={() => handleRowSelect(row.id || row.key || row._id)}
                        className="w-4 h-4 text-primary border-border-primary rounded focus:ring-primary focus:ring-2"
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      align={column.align}
                      className={column.cellClassName}
                    >
                      {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  align="center"
                  className="py-8 text-text-tertiary"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && filteredData.length > itemsPerPage && (
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / itemsPerPage)}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
});

// Table Actions Component
const TableActions = ({
  children,
  className = ''
}) => {
  return (
    <div className={cn('flex items-center justify-between p-4 bg-surface-secondary border-b border-border-primary', className)}>
      {children}
    </div>
  );
};

// Table Search Component
const TableSearch = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  className = ''
}) => {
  return (
    <div className={cn('relative', className)}>
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full pl-10 pr-4 py-2 text-sm border border-border-primary rounded-md bg-surface-primary text-text-primary focus:outline-none focus:border-border-accent"
      />
    </div>
  );
};

TableHeader.displayName = 'TableHeader';
TableCell.displayName = 'TableCell';
TableRow.displayName = 'TableRow';
TableFilter.displayName = 'TableFilter';
TablePagination.displayName = 'TablePagination';
EnhancedTable.displayName = 'EnhancedTable';
TableActions.displayName = 'TableActions';
TableSearch.displayName = 'TableSearch';

export {
  TableHeader,
  TableCell,
  TableRow,
  TableFilter,
  TablePagination,
  EnhancedTable,
  TableActions,
  TableSearch
};

export default EnhancedTable; 