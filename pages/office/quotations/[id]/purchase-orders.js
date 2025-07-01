import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import OfficeLayout from '../../../../components/OfficeLayout';

export default function QuotePurchaseOrdersPage() {
  const router = useRouter();
  const { id, job_id } = router.query;
  const [groups, setGroups] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const [itemsRes, suppRes] = await Promise.all([
          fetch(`/api/quote-items?quote_id=${id}`),
          fetch('/api/suppliers'),
        ]);
        const items = itemsRes.ok ? await itemsRes.json() : [];
        const sups = suppRes.ok ? await suppRes.json() : [];
        const map = {};
        items.forEach(it => {
          if (!it.supplier_id) return;
          map[it.supplier_id] ||= [];
          map[it.supplier_id].push(it);
        });
        setGroups(map);
        setSuppliers(sups);
      } catch {
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const supplierName = sid => suppliers.find(s => s.id === Number(sid))?.name || 'Supplier';

  const createPO = async sid => {
    const list = groups[sid] || [];
    await fetch('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: { job_id: job_id || null, supplier_id: sid, status: 'new' },
        items: list.map(i => ({ part_id: i.part_id, qty: i.qty, unit_price: i.unit_price })),
      }),
    });
    router.push('/office/quotations');
  };

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Quote #{id} Parts</h1>
      {error && <p className="text-red-500">{error}</p>}
      {Object.keys(groups).length === 0 ? (
        <p>No supplier parts found.</p>
      ) : (
        Object.entries(groups).map(([sid, items]) => (
          <div key={sid} className="mb-6">
            <h2 className="font-semibold mb-2">{supplierName(sid)}</h2>
            <ul className="mb-2">
              {items.map(it => (
                <li key={it.id} className="text-sm">
                  {(it.description || it.part_id) + ' – qty ' + it.qty + ' @ €' + it.unit_price}
                </li>
              ))}
            </ul>
            <button onClick={() => createPO(sid)} className="button px-4 text-sm">
              Generate Purchase Order
            </button>
          </div>
        ))
      )}
      <Link href="/office/quotations" className="button mt-4 inline-block">
        Back to Quotes
      </Link>
    </OfficeLayout>
  );
}
