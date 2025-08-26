import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';

export default function PartsPage() {
  const [parts, setParts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/parts').then(r => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/suppliers').then(r => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/categories').then(r => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([p, s, c]) => {
        setParts(p);
        setSuppliers(s);
        setCategories(c);
      })
      .catch(() => setError('Failed to load parts'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async id => {
    if (!confirm('Delete this part?')) return;
    await fetch(`/api/parts/${id}`, { method: 'DELETE' });
    load();
  };

  const filtered = parts.filter(p => {
    const matchesSearch = p.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || p.category_id == categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const supplierName = id => suppliers.find(s => s.id === id)?.name || '';
  const categoryName = id => categories.find(c => c.id === id)?.name || '';

  return (
    <OfficeLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Parts</h1>
        <div className="flex gap-2">
          <Link href="/office/parts/categories" className="button-secondary">
            Categories
          </Link>
          <Link href="/office/parts/new" className="button">+ New Part</Link>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="input text-sm min-w-[200px]"
              style={{ color: '#ffffff' }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} style={{ color: '#ffffff', backgroundColor: '#1e293b' }}>
                  {cat.name}
                </option>
              ))}
            </select>
            
            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search parts by number or description…"
              className="input flex-1 max-w-xl"
            />
            
            {/* Clear Filters Button */}
            {(searchQuery || categoryFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('');
                }}
                className="button-secondary text-sm px-4 py-2"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          {/* Filter Summary */}
          {(searchQuery || categoryFilter) && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filtered.length} of {parts.length} parts
              {categoryFilter && ` in category "${categoryName(categoryFilter)}"`}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}

          {/* Parts Grid - tile layout like Clients page */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(p => (
              <div
                key={p.id}
                className="item-card border-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
              >
                {/* Header: Part number */}
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-semibold text-black dark:text-white text-lg break-words pr-2">
                    {p.part_number}
                  </h2>
                  {p.unit_cost != null && (
                    <span className="ml-2 whitespace-nowrap text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      Cost: €{Number(p.unit_cost || 0).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Description */}
                {p.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                    {p.description}
                  </p>
                )}

                {/* Supplier and Category badges */}
                <div className="mb-4 space-y-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                    Supplier: {supplierName(p.supplier_id) || '—'}
                  </span>
                  {p.category_id && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-700">
                      Category: {categoryName(p.category_id)}
                    </span>
                  )}
                </div>

                {/* Pricing summary if present */}
                {(p.unit_sale_price != null || p.markup_percentage != null) && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {p.unit_sale_price != null && (
                      <div className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
                        <div className="text-gray-500 dark:text-gray-400">Unit Price</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">€{Number(p.unit_sale_price || 0).toFixed(2)}</div>
                      </div>
                    )}
                    {p.markup_percentage != null && (
                      <div className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
                        <div className="text-gray-500 dark:text-gray-400">Markup %</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{Number(p.markup_percentage || 0).toFixed(2)}%</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Link href={`/office/parts/${p.id}`} className="button px-4 text-sm flex-1 text-center">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="button px-4 text-sm bg-red-600 hover:bg-red-700 flex-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">No parts found.</div>
          )}
        </>
      )}
    </OfficeLayout>
  );
}
