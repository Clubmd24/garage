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
        <Link href="/office/vehicles/new">
          <a className="btn">+ New Vehicle</a>
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
                <th className="px-4 py-2 border text-black">Plate</th>
                <th className="px-4 py-2 border text-black">Make</th>
                <th className="px-4 py-2 border text-black">Model</th>
                <th className="px-4 py-2 border text-black">Color</th>
                <th className="px-4 py-2 border text-black">Client</th>
                <th className="px-4 py-2 border text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td className="px-4 py-2 border text-black">{v.licence_plate}</td>
                  <td className="px-4 py-2 border text-black">{v.make}</td>
                  <td className="px-4 py-2 border text-black">{v.model}</td>
                  <td className="px-4 py-2 border text-black">{v.color}</td>
                  <td className="px-4 py-2 border text-black">{v.customer_name}</td>
                  <td className="px-4 py-2 border text-black">
                    <Link href={`/office/vehicles/view/${v.id}`}>
                      <a className="mr-2 underline">View</a>
                    </Link>
                    <Link href={`/office/vehicles/${v.id}`}>
                      <a className="mr-2 underline">Edit</a>
                    </Link>
                    <button onClick={() => handleDelete(v.id)} className="underline text-red-600">
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

export default VehiclesPage;
