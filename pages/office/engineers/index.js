import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';

const EngineersPage = () => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/engineers')
      .then(r => (r.ok ? r.json() : Promise.reject()))
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

  const filtered = engineers.filter(e =>
    e.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <OfficeLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Engineers</h1>
        <div className="flex gap-2">
          <Link href="/office/engineers/new" className="button">+ New Engineer</Link>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search engineers by name or email…"
            className="input mb-6 w-full max-w-xl"
          />

                {/* Engineers Grid - tile layout like Parts/Clients page */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(e => (
            <div
              key={e.id}
              className="item-card border-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
            >
              {/* Header: Engineer name */}
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-semibold text-black dark:text-white text-lg break-words pr-2">
                  {e.username}
                </h2>
                <span className="ml-2 whitespace-nowrap text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-800 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
                  Active
                </span>
              </div>

              {/* Email */}
              {e.email && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {e.email}
                </p>
              )}

              {/* Role and Status badges */}
              <div className="mb-4 space-y-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                  Role: Mechanic
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-700">
                  Status: Available
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Link href={`/office/engineers/view/${e.id}`} className="button px-4 text-sm flex-1 text-center">
                  View
                </Link>
                <Link href={`/office/engineers/${e.id}`} className="button px-4 text-sm flex-1 text-center">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(e.id)}
                  className="button px-4 text-sm bg-red-600 hover:bg-red-700 flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">No engineers found.</div>
          )}
        </>
      )}
    </OfficeLayout>
  );
};

export default EngineersPage;
