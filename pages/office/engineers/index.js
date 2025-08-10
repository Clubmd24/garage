import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchEngineers } from '../../../lib/engineers';

const EngineersPage = () => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = () => {
    setLoading(true);
    fetchEngineers()
      .then(setEngineers)
      .catch(() => setError('Failed to load engineers'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async id => {
    if (!confirm('Delete this engineer?')) return;
    await fetch(`/api/engineers/${id}`, { method: 'DELETE' });
    load();
  };

  const filtered = engineers.filter(e => {
    const q = searchQuery.toLowerCase();
    return (
      e.username.toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <OfficeLayout>
      {/* Enhanced Header with Action Bar */}
      <div className="action-bar">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Engineers</h1>
          <p className="text-text-secondary mt-1">Manage your engineering team and their assignments</p>
        </div>
        <div className="action-buttons">
          <Link href="/office/engineers/new" className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Engineer
          </Link>
        </div>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search engineers by name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select className="filter-select">
          <option value="">All Roles</option>
          <option value="mechanic">Mechanic</option>
          <option value="technician">Technician</option>
          <option value="apprentice">Apprentice</option>
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
          <p className="text-text-secondary">Loading engineers...</p>
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

      {/* Enhanced Engineers Grid */}
      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(e => (
            <div key={e.id} className="card p-6 hover-lift">
              {/* Engineer Avatar and Status */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {e.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-text-primary text-lg mb-1">
                    {e.username}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {e.email || 'No email provided'}
                  </p>
                </div>
                <div className="status-badge status-badge-success">Active</div>
              </div>

              {/* Engineer Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Role:</span>
                  <span className="text-text-primary font-medium">Mechanic</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Status:</span>
                  <span className="text-text-primary font-medium">Available</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Link 
                  href={`/office/engineers/view/${e.id}`} 
                  className="btn btn-secondary flex-1 justify-center text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </Link>
                
                <Link 
                  href={`/office/engineers/${e.id}`} 
                  className="btn btn-primary flex-1 justify-center text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
                
                <button
                  onClick={() => handleDelete(e.id)}
                  className="btn btn-error flex-1 justify-center text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium text-text-primary mb-2">No engineers found</h3>
          <p className="text-text-secondary mb-6">
            {searchQuery ? `No engineers match "${searchQuery}"` : 'Get started by adding your first engineer'}
          </p>
          <Link href="/office/engineers/new" className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add First Engineer
          </Link>
        </div>
      )}
    </OfficeLayout>
  );
};

export default EngineersPage;
