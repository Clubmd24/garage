import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../../components/Layout';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/suppliers')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setSuppliers)
      .catch(() => setError('Failed to load suppliers'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = suppliers.filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <Link href="/office/suppliers/new" className="button">
          + New Supplier
        </Link>
      </div>
      <Link href="/office" className="button inline-block mb-4">Return to Office</Link>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search…"
            className="input mb-4 w-full"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(s => (
              <div key={s.id} className="item-card">
                <h2 className="font-semibold mb-1">{s.name}</h2>
                <p className="text-sm">{s.email_address}</p>
                <p className="text-sm">{s.contact_number}</p>
                <Link href={`/office/suppliers/${s.id}`} className="button mt-2 px-4 text-sm">
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
