import { useState } from 'react';

export default function ResponsiveTable({ 
  data, 
  columns, 
  onRowClick, 
  className = '',
  sortable = false,
  onSort = null,
  sortColumn = null,
  sortDirection = 'asc'
}) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (column) => {
    if (sortable && onSort) {
      onSort(column);
    }
  };

  return (
    <div className={`responsive-table ${className}`}>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column, index) => (
                <th 
                  key={index}
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${
                    sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-50' : ''
                  }`}
                  onClick={() => sortable && column.sortable !== false ? handleSort(column.key) : null}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortable && column.sortable !== false && sortColumn === column.key && (
                      <span className="text-gray-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick && onRowClick(row, rowIndex)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-sm">
                    {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden space-y-3">
        {data.map((row, rowIndex) => (
          <div 
            key={rowIndex}
            className={`bg-white rounded-lg border border-gray-200 shadow-sm ${
              onRowClick ? 'cursor-pointer hover:shadow-md' : ''
            }`}
            onClick={() => onRowClick && onRowClick(row, rowIndex)}
          >
            <div className="p-4">
              {/* Primary content - always visible */}
              <div className="flex justify-between items-start mb-3">
                {columns.slice(0, 2).map((column, colIndex) => (
                  <div key={colIndex} className="flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {column.label}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                    </div>
                  </div>
                ))}
                {columns.length > 2 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRow(rowIndex);
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg 
                      className={`w-4 h-4 transform transition-transform ${
                        expandedRows.has(rowIndex) ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Secondary content - expandable */}
              {columns.length > 2 && expandedRows.has(rowIndex) && (
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  {columns.slice(2).map((column, colIndex) => (
                    <div key={colIndex} className="flex justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        {column.label}
                      </span>
                      <span className="text-sm text-gray-900">
                        {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 