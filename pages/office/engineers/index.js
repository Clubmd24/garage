import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../../components/Layout';
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
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Engineers</h1>
        <Link href="/office/engineers/new" className="button">
          + New Engineer
        </Link>
      </div>
      <Link href="/office" className="button inline-block mb-4">
        Return to Office
      </Link>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input mb-4 w-full"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(e => (
              <div key={e.id} className="item-card">
                <h2 className="font-semibold text-black text-lg mb-1">
                  {e.username}
                </h2>
                <p className="text-sm text-black">
                  {e.email || '—'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/office/engineers/view/${e.id}`} className="button px-4 text-sm">
                    View
                  </Link>
                  <Link href={`/office/engineers/${e.id}`} className="button px-4 text-sm">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="button px-4 text-sm bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default EngineersPage;
