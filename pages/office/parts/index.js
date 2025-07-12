import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';

export default function PartsPage() {
  const [parts, setParts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/parts').then(r => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/suppliers').then(r => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([p, s]) => {
        setParts(p);
        setSuppliers(s);
      })
      .catch(() => setError('Failed to load parts'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async id => {
    if (!confirm('Delete this part?')) return;
    await fetch(`/api/parts/${id}`, { method: 'DELETE' });
    load();
  };

  const filtered = parts.filter(p =>
    p.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const supplierName = id => suppliers.find(s => s.id === id)?.name || '';

  return (
    <OfficeLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Parts</h1>
        <Link href="/office/parts/new" className="button">+ New Part</Link>
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
            placeholder="Search…"
            className="input mb-4 w-full"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(p => (
              <div key={p.id} className="item-card">
                <h2 className="font-semibold mb-1">{p.part_number}</h2>
                <p className="text-sm">{p.description}</p>
                <p className="text-sm">Supplier: {supplierName(p.supplier_id)}</p>
                <div className="mt-2 flex gap-2">
                  <Link href={`/office/parts/${p.id}`} className="button px-4 text-sm">Edit</Link>
                  <button onClick={() => handleDelete(p.id)} className="button px-4 text-sm bg-red-600 hover:bg-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </OfficeLayout>
  );
}
