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
          <Link href="/office/clients/new">
            <a className="button">+ New Client</a>
          </Link>
      </div>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
        <input
          type="text"
          placeholder="Search…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="mb-4 border px-3 py-2 rounded text-black w-full"
        />
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border text-black">Name</th>
              <th className="px-4 py-2 border text-black">Email</th>
              <th className="px-4 py-2 border text-black">Mobile</th>
              <th className="px-4 py-2 border text-black">NIE Number</th>
              <th className="px-4 py-2 border text-black">Street Address</th>
              <th className="px-4 py-2 border text-black">Post Code</th>
              <th className="px-4 py-2 border text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
              {filteredClients.map(c => (
              <tr key={c.id}>
                <td className="px-4 py-2 border text-black">{`${c.first_name || ''} ${c.last_name || ''}`.trim()}</td>
                <td className="px-4 py-2 border text-black">{c.email}</td>
                <td className="px-4 py-2 border text-black">{c.mobile}</td>
                <td className="px-4 py-2 border text-black">{c.nie_number}</td>
                <td className="px-4 py-2 border text-black">{c.street_address}</td>
                <td className="px-4 py-2 border text-black">{c.post_code}</td>
                <td className="px-4 py-2 border text-black">
                  <Link href={`/office/clients/view/${c.id}`}>
                    <a className="mr-2 underline">View</a>
                  </Link>
                  <Link href={`/office/clients/${c.id}`}>
                    <a className="mr-2 underline">Edit</a>
                  </Link>
                  <button onClick={() => handleDelete(c.id)} className="underline text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </>
      )}
    </Layout>
  );
};

export default ClientsPage;
