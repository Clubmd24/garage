import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchQuotes, updateQuote } from '../../../lib/quotes';
import { fetchClients } from '../../../lib/clients';
import { fetchVehicles } from '../../../lib/vehicles';

const QuotationsPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
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
    fetchVehicles()
      .then(setVehicles)
      .catch(() => setVehicles([]));
  }, []);

  const router = useRouter();

  const approve = async quote => {
    let jobId = quote.job_id;
    if (jobId) {
      await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'unassigned' }),
      });
    } else {
      // Create job with the same ID as the quote for pipeline numbering
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: quote.id, // Use quote ID as job ID
          customer_id: quote.customer_id, 
          vehicle_id: quote.vehicle_id 
        }),
      });
      const job = res.ok ? await res.json() : null;
      jobId = job?.id;
    }
    await updateQuote(quote.id, { status: 'approved', job_id: jobId });
    router.push(`/office/quotations/${quote.id}/purchase-orders?job_id=${jobId}`);
  };

  const convert = async id => {
    await updateQuote(id, { status: 'job-card' });
    load();
  };

  const reject = async id => {
    await updateQuote(id, { status: 'rejected' });
    load();
  };

  const handleDelete = async id => {
    if (!confirm('Delete this quote?')) return;
    await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
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

  const vehicleMap = useMemo(() => {
    const m = {};
    vehicles.forEach(v => {
      m[v.id] = v;
    });
    return m;
  }, [vehicles]);

  const filtered = visible.filter(q => {
    const qStr = searchQuery.toLowerCase();
    const name = (clientMap[q.customer_id] || '').toLowerCase();
    const licence = (vehicleMap[q.vehicle_id]?.licence_plate || '').toLowerCase();
    const make = (vehicleMap[q.vehicle_id]?.make || '').toLowerCase();
    return (
      name.includes(qStr) ||
      licence.includes(qStr) ||
      make.includes(qStr) ||
      String(q.id).includes(qStr) ||
      String(q.total_amount).includes(qStr) ||
      (q.status || '').toLowerCase().includes(qStr)
    );
  });

  return (
    <OfficeLayout>
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
              <p className="text-sm">{clientMap[q.customer_id] || ''}</p>
              <p className="text-sm">{vehicleMap[q.vehicle_id]?.licence_plate || ''}</p>
              <p className="text-sm">{vehicleMap[q.vehicle_id]?.make || ''}</p>
              <p className="text-sm">Total: €{q.total_amount}</p>
              <p className="text-sm capitalize">Status: {q.status}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {q.status !== 'approved' && q.status !== 'job-card' && (
                  <button
                    onClick={() => approve(q)}
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
                <Link
                  href={`/office/quotations/${q.id}/edit`}
                  className="button px-4 text-sm"
                >
                  Edit
                </Link>
                <a
                  href={`/api/quotes/${q.id}/pdf?t=${Date.now()}`}
                  className="button-secondary px-4 text-sm"
                >
                  Download PDF
                </a>
                <button
                  onClick={() => reject(q.id)}
                  className="button-secondary px-4 text-sm"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
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

export default QuotationsPage;
