import React from 'react';

// Table Component
const Table = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const baseClasses = 'table-modern w-full border-collapse';
  
  const variantClasses = {
    default: 'table-modern',
    striped: 'table-striped',
    bordered: 'table-bordered',
    compact: 'table-compact'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <table className={classes} {...props}>
      {children}
    </table>
  );
};

// Table Header Component
const TableHeader = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
};

// Table Body Component
const TableBody = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

// Table Footer Component
const TableFooter = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tfoot className={className} {...props}>
      {children}
    </tfoot>
  );
};

// Table Row Component
const TableRow = ({
  children,
  className = '',
  hover = true,
  selected = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'border-b border-border-primary/50 transition-all duration-200';
  const hoverClasses = hover ? 'hover:bg-surface-secondary/50 hover:shadow-sm cursor-pointer' : '';
  const selectedClasses = selected ? 'bg-primary/10 border-primary/20' : '';
  
  const classes = [
    baseClasses,
    hoverClasses,
    selectedClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <tr
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
};

// Table Header Cell Component
const TableHeaderCell = ({
  children,
  className = '',
  sortable = false,
  sortDirection = null,
  onSort,
  ...props
}) => {
  const baseClasses = 'table-modern th text-left text-sm font-semibold text-text-secondary uppercase tracking-wider';
  const sortableClasses = sortable ? 'cursor-pointer hover:bg-surface-tertiary/50' : '';
  
  const classes = [
    baseClasses,
    sortableClasses,
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  const renderSortIcon = () => {
    if (!sortable) return null;
    
    if (sortDirection === 'asc') {
      return <span className="ml-2">↑</span>;
    } else if (sortDirection === 'desc') {
      return <span className="ml-2">↓</span>;
    }
    
    return <span className="ml-2 text-text-muted">↕</span>;
  };

  return (
    <th
      className={classes}
      onClick={handleClick}
      {...props}
    >
      <div className="flex items-center">
        {children}
        {renderSortIcon()}
      </div>
    </th>
  );
};

// Table Cell Component
const TableCell = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td className={`table-modern td ${className}`} {...props}>
      {children}
    </td>
  );
};

// Data Table Component with Built-in Sorting and Pagination
const DataTable = ({
  columns,
  data,
  sortColumn,
  sortDirection,
  onSort,
  currentPage = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  className = '',
  ...props
}) => {
  const handleSort = (columnKey) => {
    if (onSort) {
      const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(columnKey, newDirection);
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className={className} {...props}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHeaderCell
                key={column.key}
                sortable={column.sortable}
                sortDirection={sortColumn === column.key ? sortDirection : null}
                onSort={() => handleSort(column.key)}
              >
                {column.label}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

// Enhanced Table with Search and Filters
const EnhancedTable = ({
  columns,
  data,
  searchValue = '',
  onSearchChange,
  filters = [],
  onFilterChange,
  sortColumn,
  sortDirection,
  onSort,
  currentPage = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  className = '',
  ...props
}) => {
  return (
    <div className={className} {...props}>
      {/* Search and Filter Bar */}
      <div className="mb-6 p-4 bg-surface-secondary rounded-xl border border-border-primary">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          {onSearchChange && (
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-4 py-2 bg-surface-primary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          )}
          
          {/* Filters */}
          {filters.length > 0 && (
            <div className="flex gap-2">
              {filters.map((filter) => (
                <select
                  key={filter.key}
                  value={filter.value || ''}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="px-3 py-2 bg-surface-primary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">{filter.placeholder}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHeaderCell,
  TableCell,
  DataTable,
  EnhancedTable
};
