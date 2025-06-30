import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Layout } from '../../../components/Layout';
import { fetchQuotes, updateQuote } from '../../../lib/quotes';
import { fetchClients } from '../../../lib/clients';

const QuotationsPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const load = () => {
    setLoading(true);
    fetchQuotes()
      .then(setQuotes)
      .catch(() => setError('Failed to load quotes'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    fetchClients()
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  const approve = async id => {
    const itemsRes = await fetch(`/api/quote-items?quote_id=${id}`);
    const items = itemsRes.ok ? await itemsRes.json() : [];
    const bySupplier = {};
    items.forEach(it => {
      if (!it.supplier_id) return;
      bySupplier[it.supplier_id] ||= [];
      bySupplier[it.supplier_id].push(it);
    });
    for (const [supplier_id, group] of Object.entries(bySupplier)) {
      await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: { job_id: null, supplier_id, status: 'new' },
          items: group.map(g => ({
            part_id: g.part_id,
            qty: g.qty,
            unit_price: g.unit_price,
          })),
        }),
      });
    }
    await updateQuote(id, { status: 'approved' });
    load();
  };

  const convert = async id => {
    const itemsRes = await fetch(`/api/quote-items?quote_id=${id}`);
    const items = itemsRes.ok ? await itemsRes.json() : [];
    const bySupplier = {};
    items.forEach(it => {
      if (!it.supplier_id) return;
      bySupplier[it.supplier_id] ||= [];
      bySupplier[it.supplier_id].push(it);
    });
    for (const [supplier_id, group] of Object.entries(bySupplier)) {
      await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: { job_id: null, supplier_id, status: 'new' },
          items: group.map(g => ({
            part_id: g.part_id,
            qty: g.qty,
            unit_price: g.unit_price,
          })),
        }),
      });
    }
    await updateQuote(id, { status: 'job-card' });
    load();
  };

  const visible = quotes.filter(
    q => !['job-card', 'completed', 'invoiced'].includes(q.status)
  );

  const clientMap = useMemo(() => {
    const m = {};
    clients.forEach(c => {
      m[c.id] = `${c.first_name || ''} ${c.last_name || ''}`.trim();
    });
    return m;
  }, [clients]);

  const filtered = visible.filter(q => {
    const qStr = searchQuery.toLowerCase();
    const name = (clientMap[q.customer_id] || '').toLowerCase();
    return (
      name.includes(qStr) ||
      String(q.id).includes(qStr) ||
      String(q.customer_id).includes(qStr) ||
      String(q.total_amount).includes(qStr) ||
      (q.status || '').toLowerCase().includes(qStr)
    );
  });

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Quotations</h1>
        <Link href="/office/quotations/new" className="button px-4 text-sm">
          Create New Quote
        </Link>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input mb-4 w-full"
          />
          <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(q => (
            <div key={q.id} className="item-card">
              <h2 className="font-semibold mb-1">Quote #{q.id}</h2>
              <p className="text-sm">Client ID: {q.customer_id}</p>
              <p className="text-sm">Total: €{q.total_amount}</p>
              <p className="text-sm capitalize">Status: {q.status}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {q.status !== 'approved' && q.status !== 'job-card' && (
                  <button
                    onClick={() => approve(q.id)}
                    className="button px-4 text-sm"
                  >
                    Approve
                  </button>
                )}
                {q.status === 'approved' && (
                  <button
                    onClick={() => convert(q.id)}
                    className="button px-4 text-sm"
                  >
                    Create Job Card
                  </button>
                )}
                <a
                  href={`/api/quotes/${q.id}/pdf`}
                  className="button-secondary px-4 text-sm"
                >
                  Download PDF
                </a>
              </div>
            </div>
          ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default QuotationsPage;
