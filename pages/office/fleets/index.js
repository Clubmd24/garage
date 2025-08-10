import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchFleets } from '../../../lib/fleets';

const FleetsPage = () => {
  const [fleets, setFleets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = () => {
    setLoading(true);
    fetchFleets()
      .then(setFleets)
      .catch(() => setError('Failed to load fleets'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);


  const filtered = fleets.filter(f => {
    const q = searchQuery.toLowerCase();
    return (
      f.company_name.toLowerCase().includes(q) ||
      (f.account_rep || '').toLowerCase().includes(q)
    );
  });

  return (
    <OfficeLayout>
      {/* Enhanced Header with Action Bar */}
      <div className="action-bar">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Fleets</h1>
          <p className="text-text-secondary mt-1">Manage company fleet accounts and their vehicles</p>
        </div>
        <div className="action-buttons">
          <Link href="/office/fleets/new" className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Fleet
          </Link>
        </div>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search fleets by company name or account rep..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select className="filter-select">
          <option value="">All Fleets</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="btn btn-secondary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Filter
        </button>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="card p-8 text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading fleets...</p>
        </div>
      )}
      
      {error && (
        <div className="card p-6 border-error/20 bg-error/5">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-error font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Enhanced Fleets Grid */}
      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(f => (
            <div key={f.id} className="card p-6 hover-lift">
              {/* Fleet Company Info */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-warning rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {f.company_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-text-primary text-lg mb-1">
                    {f.company_name}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {f.account_rep || 'No account rep assigned'}
                  </p>
                </div>
                <div className="status-badge status-badge-primary">Active</div>
              </div>

              {/* Fleet Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Account Rep:</span>
                  <span className="text-text-primary font-medium">
                    {f.account_rep || 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Status:</span>
                  <span className="text-text-primary font-medium">Active</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Link 
                  href={`/office/fleets/view/${f.id}`} 
                  className="btn btn-secondary flex-1 justify-center text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </Link>
                
                <Link 
                  href={`/office/fleets/${f.id}`} 
                  className="btn btn-primary flex-1 justify-center text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-medium text-text-primary mb-2">No fleets found</h3>
          <p className="text-text-secondary mb-6">
            {searchQuery ? `No fleets match "${searchQuery}"` : 'Get started by adding your first fleet account'}
          </p>
          <Link href="/office/fleets/new" className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add First Fleet
          </Link>
        </div>
      )}
    </OfficeLayout>
  );
};

export default FleetsPage;

