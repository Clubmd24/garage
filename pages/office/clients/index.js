// pages/office/clients/index.js
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../../components/Layout';
import { fetchClients } from '../../../lib/clients';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = () => {
    setLoading(true);
    fetchClients()
      .then(setClients)
      .catch(() => setError('Failed to load clients'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async id => {
    if (!confirm('Delete this client?')) return;
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    load();
  };

  const filteredClients = clients.filter(c => {
    const q = searchQuery.toLowerCase();
    const name = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    return (
      name.includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.nie_number || '').toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link href="/office/clients/new" className="button">
          + New Client
        </Link>
      </div>
      <Link href="/office" className="button inline-block mb-4">Return to Office</Link>
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
          {filteredClients.map(c => (
            <div key={c.id} className="item-card">
              <h2 className="font-semibold text-[var(--color-text-primary)] dark:text-black text-lg mb-1">
                {`${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unnamed'}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-black">{c.email}</p>
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-black">{c.mobile}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/office/clients/view/${c.id}`} className="button px-4 text-sm">
                  View
                </Link>
                <Link href={`/office/clients/${c.id}`} className="button px-4 text-sm">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(c.id)}
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

export default ClientsPage;
