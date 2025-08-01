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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Fleets</h1>
        <Link href="/office/fleets/new" className="button">
          + New Fleet
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
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(f => (
              <div key={f.id} className="item-card">
                <h2 className="font-semibold text-black dark:text-white text-lg mb-1">
                  {f.company_name}
                </h2>
              </div>
            ))}
          </div>
        </>
      )}
    </OfficeLayout>
  );
};

export default FleetsPage;

