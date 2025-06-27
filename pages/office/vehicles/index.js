import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../../components/Layout';
import { fetchVehicles } from '../../../lib/vehicles';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = () => {
    setLoading(true);
    fetchVehicles()
      .then(setVehicles)
      .catch(() => setError('Failed to load vehicles'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async id => {
    if (!confirm('Delete this vehicle?')) return;
    await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
    load();
  };

  const filtered = vehicles.filter(v => {
    const q = searchQuery.toLowerCase();
    return (
      v.licence_plate.toLowerCase().includes(q) ||
      (v.make || '').toLowerCase().includes(q) ||
      (v.model || '').toLowerCase().includes(q) ||
      (v.customer_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Vehicles</h1>
        <Link href="/office/vehicles/new" className="button">
          + New Vehicle
        </Link>
      </div>
      <Link href="/office" className="underline block mb-4">
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
            {filtered.map(v => (
              <div key={v.id} className="item-card">
                <h2 className="font-semibold text-[var(--color-text-primary)] text-lg mb-1">
                  {v.licence_plate}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {v.make} {v.model}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">{v.color}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{v.customer_name}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/office/vehicles/view/${v.id}`} className="button px-4 text-sm">
                    View
                  </Link>
                  <Link href={`/office/vehicles/${v.id}`} className="button px-4 text-sm">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(v.id)}
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

export default VehiclesPage;
