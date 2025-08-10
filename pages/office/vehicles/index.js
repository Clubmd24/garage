import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchVehicles } from '../../../lib/vehicles';
import { fetchFleets } from '../../../lib/fleets';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fleets, setFleets] = useState([]);
  const [selectedFleet, setSelectedFleet] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([fetchVehicles(), fetchFleets()])
      .then(([v, f]) => {
        setVehicles(v);
        setFleets(f);
      })
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
    if (selectedFleet && String(v.fleet_id) !== selectedFleet) return false;
    const q = searchQuery.toLowerCase();
    return (
      v.licence_plate.toLowerCase().includes(q) ||
      (v.make || '').toLowerCase().includes(q) ||
      (v.model || '').toLowerCase().includes(q) ||
      (v.vin_number || '').toLowerCase().includes(q) ||
      (v.customer_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <OfficeLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Vehicles</h1>
        <Link href="/office/vehicles/new" className="button">
          + New Vehicle
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
            className="input mb-4 w-full"
          />
          <select
            value={selectedFleet}
            onChange={e => setSelectedFleet(e.target.value)}
            className="input mb-4 w-full"
          >
            <option value="">All Fleets</option>
            {fleets.filter(f => f.id !== 2).map(f => (
              <option key={f.id} value={f.id}>
                {f.company_name}
              </option>
            ))}
          </select>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(v => (
              <div key={v.id} className="item-card">
                <h2 className="font-semibold text-black dark:text-white text-lg mb-1">
                  {v.licence_plate}
                </h2>
                <p className="text-sm text-black dark:text-white">
                  {v.make} {v.model}
                </p>
                <p className="text-sm text-black dark:text-white">{v.color}</p>
                <p className="text-sm text-black dark:text-white">VIN: {v.vin_number}</p>
                <p className="text-sm text-black dark:text-white">{v.customer_name}</p>
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
    </OfficeLayout>
  );
};

export default VehiclesPage;
