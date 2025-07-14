import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import OfficeLayout from '../../../../components/OfficeLayout';

export default function JobPurchaseOrdersPage() {
  const router = useRouter();
  const { id } = router.query;
  const [parts, setParts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const [quotesRes, suppRes] = await Promise.all([
          fetch(`/api/quotes?job_id=${id}`),
          fetch('/api/suppliers'),
        ]);
        const quotes = quotesRes.ok ? await quotesRes.json() : [];
        const suppliers = suppRes.ok ? await suppRes.json() : [];
        const items = (
          await Promise.all(
            quotes.map(q =>
              fetch(`/api/quote-items?quote_id=${q.id}`).then(r =>
                r.ok ? r.json() : [],
              ),
            ),
          )
        ).flat();
        const map = {};
        items.forEach(it => {
          if (!it.part_id) return;
          map[it.part_id] = {
            id: it.part_id,
            part_number: it.partNumber,
            description: it.description,
            supplier_id: it.supplier_id,
          };
        });
        setParts(Object.values(map));
        setSuppliers(suppliers);
      } catch {
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const toggle = pid =>
    setSelected(sel => ({ ...sel, [pid]: !sel[pid] }));

  const supplierName = sid => suppliers.find(s => s.id === sid)?.name || 'Supplier';

  const groups = parts.reduce((acc, p) => {
    if (selected[p.id]) {
      acc[p.supplier_id] ||= [];
      acc[p.supplier_id].push(p);
    }
    return acc;
  }, {});

  const createOrders = async requestQuote => {
    for (const [sid, items] of Object.entries(groups)) {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: { job_id: id, supplier_id: Number(sid), status: 'new' },
          items: items.map(it => ({ part_id: it.id })),
        }),
      });
      if (requestQuote && res.ok) {
        const po = await res.json();
        await fetch(`/api/purchase-orders/${po.id}/request-quote`, {
          method: 'POST',
        });
      }
    }
    if (requestQuote) {
      await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'awaiting supplier information' }),
      });
    }
    router.push(`/office/jobs/${id}`);
  };

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Job #{id} Parts</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-y-2 mb-4 text-black">
        {parts.map(p => (
          <label key={p.id} className="block">
            <input
              type="checkbox"
              checked={!!selected[p.id]}
              onChange={() => toggle(p.id)}
              className="mr-2"
            />
            {p.part_number} - {p.description}
          </label>
        ))}
      </div>
      {Object.keys(groups).length > 0 && (
        <div className="mb-4">
          {Object.entries(groups).map(([sid, items]) => (
            <div key={sid} className="mb-2 text-sm">
              <p className="font-semibold mb-1">{supplierName(Number(sid))}</p>
              <ul className="list-disc ml-4">
                {items.map(it => (
                  <li key={it.id}>{it.part_number} - {it.description}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={() => createOrders(false)} className="button px-4">
          Send Purchase Order
        </button>
        <button onClick={() => createOrders(true)} className="button-secondary px-4">
          Request Supplier Quote
        </button>
        <Link href={`/office/jobs/${id}`} className="button-secondary px-4">
          Cancel
        </Link>
      </div>
    </OfficeLayout>
  );
}
