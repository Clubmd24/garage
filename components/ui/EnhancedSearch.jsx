import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';

// Search Input Component
export const SearchInput = React.forwardRef(({
  placeholder = "Search...",
  value = "",
  onChange,
  onSearch,
  className = "",
  size = "md",
  variant = "default",
  showClear = true,
  autoFocus = false,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleClear = () => {
    setInputValue("");
    onChange?.("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch?.(inputValue);
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-5 text-lg'
  };

  const variantClasses = {
    default: 'bg-surface-primary border-border-primary focus:border-primary',
    filled: 'bg-surface-secondary border-transparent focus:border-primary',
    outlined: 'bg-transparent border-border-primary focus:border-primary'
  };

  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'relative flex items-center transition-all duration-200',
        sizeClasses[size],
        variantClasses[variant],
        'border rounded-lg focus-within:ring-2 focus-within:ring-primary/20',
        isFocused && 'ring-2 ring-primary/20'
      )}>
        <Search className="w-4 h-4 text-text-muted mr-2" />
        <input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-muted"
          {...props}
        />
        {showClear && inputValue && (
          <button
            onClick={handleClear}
            className="ml-2 p-1 hover:bg-surface-secondary rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-text-muted hover:text-text-primary" />
          </button>
        )}
      </div>
    </div>
  );
});

// Filter Dropdown Component
export const FilterDropdown = React.forwardRef(({
  label = "Filter",
  options = [],
  selectedValues = [],
  onSelectionChange,
  multiple = true,
  placeholder = "Select filters",
  className = "",
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSelected, setLocalSelected] = useState(selectedValues);

  useEffect(() => {
    setLocalSelected(selectedValues);
  }, [selectedValues]);

  const handleToggle = (value) => {
    if (multiple) {
      const newSelected = localSelected.includes(value)
        ? localSelected.filter(v => v !== value)
        : [...localSelected, value];
      setLocalSelected(newSelected);
      onSelectionChange?.(newSelected);
    } else {
      setLocalSelected([value]);
      onSelectionChange?.([value]);
      setIsOpen(false);
    }
  };

  const handleClearAll = () => {
    setLocalSelected([]);
    onSelectionChange?.([]);
  };

  const selectedCount = localSelected.length;

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-full px-4 py-2 text-left',
          'bg-surface-primary border border-border-primary rounded-lg',
          'hover:border-border-accent focus:outline-none focus:ring-2 focus:ring-primary/20',
          'transition-all duration-200'
        )}
        {...props}
      >
        <span className="text-text-primary">
          {selectedCount > 0 ? `${label} (${selectedCount})` : label}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 text-text-muted transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="bg-surface-primary border border-border-primary rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-text-muted text-sm">
                  No options available
                </div>
              ) : (
                <>
                  {multiple && selectedCount > 0 && (
                    <div className="px-4 py-2 border-b border-border-primary">
                      <button
                        onClick={handleClearAll}
                        className="text-sm text-primary hover:text-primary-light transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                  {options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleToggle(option.value)}
                      className={cn(
                        'w-full px-4 py-2 text-left hover:bg-surface-secondary transition-colors',
                        localSelected.includes(option.value) && 'bg-primary/10 text-primary'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary">{option.label}</span>
                        {localSelected.includes(option.value) && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Sort Dropdown Component
export const SortDropdown = React.forwardRef(({
  label = "Sort",
  options = [],
  selectedValue = "",
  onSelectionChange,
  className = "",
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value) => {
    onSelectionChange?.(value);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-full px-4 py-2 text-left',
          'bg-surface-primary border border-border-primary rounded-lg',
          'hover:border-border-accent focus:outline-none focus:ring-2 focus:ring-primary/20',
          'transition-all duration-200'
        )}
        {...props}
      >
        <span className="text-text-primary">
          {selectedOption ? selectedOption.label : label}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 text-text-muted transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="bg-surface-primary border border-border-primary rounded-lg shadow-lg">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full px-4 py-2 text-left hover:bg-surface-secondary transition-colors',
                    selectedValue === option.value && 'bg-primary/10 text-primary'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">{option.label}</span>
                    {option.direction && (
                      option.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Advanced Search Component
export const AdvancedSearch = React.forwardRef(({
  searchValue = "",
  onSearchChange,
  onSearch,
  filters = [],
  onFiltersChange,
  sortOptions = [],
  sortValue = "",
  onSortChange,
  placeholder = "Search...",
  className = "",
  showFilters = true,
  showSort = true,
  ...props
}, ref) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (filterKey, values) => {
    const newFilters = { ...localFilters, [filterKey]: values };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {};
    filters.forEach(filter => {
      clearedFilters[filter.key] = [];
    });
    setLocalFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const activeFiltersCount = Object.values(localFilters).reduce((count, values) => {
    return count + (Array.isArray(values) ? values.length : 0);
  }, 0);

  return (
    <div className={cn('space-y-4', className)} ref={ref}>
      {/* Search Bar */}
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <SearchInput
            placeholder={placeholder}
            value={searchValue}
            onChange={onSearchChange}
            onSearch={onSearch}
            size="md"
            variant="default"
            {...props}
          />
        </div>
        
        {showFilters && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200',
              'bg-surface-primary border-border-primary hover:border-border-accent',
              'focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-1 text-xs bg-primary text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}
        
        {showSort && (
          <SortDropdown
            label="Sort"
            options={sortOptions}
            selectedValue={sortValue}
            onSelectionChange={onSortChange}
          />
        )}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-surface-secondary rounded-lg border border-border-primary">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-text-primary">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-primary hover:text-primary-light transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filters.map((filter) => (
                  <FilterDropdown
                    key={filter.key}
                    label={filter.label}
                    options={filter.options}
                    selectedValues={localFilters[filter.key] || []}
                    onSelectionChange={(values) => handleFilterChange(filter.key, values)}
                    multiple={filter.multiple !== false}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Search Results Component
export const SearchResults = React.forwardRef(({
  results = [],
  loading = false,
  emptyMessage = "No results found",
  onResultClick,
  renderResult,
  className = "",
  ...props
}, ref) => {
  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-surface-secondary rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-text-muted" />
        </div>
        <p className="text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)} ref={ref} {...props}>
      {results.map((result, index) => (
        <div
          key={result.id || index}
          onClick={() => onResultClick?.(result)}
          className="p-3 bg-surface-primary border border-border-primary rounded-lg hover:bg-surface-secondary cursor-pointer transition-colors"
        >
          {renderResult ? renderResult(result) : (
            <div className="text-text-primary">
              {result.title || result.name || JSON.stringify(result)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

// Export all components
export {
  SearchInput,
  FilterDropdown,
  SortDropdown,
  AdvancedSearch,
  SearchResults
}; 