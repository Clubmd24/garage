import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { fetchVehicles } from '../../lib/vehicles';
import { fetchQuotes, updateQuote } from '../../lib/quotes';
import { fetchInvoices } from '../../lib/invoices';
import { Card } from '../../components/Card';

export default function LocalDashboard() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('All');
  const [jobs, setJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('all');
  const brandOptions = ['All', ...Array.from(new Set(vehicles.map(v => v.make)))];

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/portal/local/me');
      if (!res.ok) return router.replace('/local/login');
      const c = await res.json();
      setClient(c);
      const [veh, j, q, inv] = await Promise.all([
        fetchVehicles(c.id, null),
        fetch(`/api/jobs?customer_id=${c.id}`).then(r => r.json()),
        fetch(`/api/quotes?customer_id=${c.id}`).then(r => r.json()),
        fetch(`/api/invoices?customer_id=${c.id}`).then(r => r.json()),
      ]);
      setVehicles(veh);
      setJobs(j);
      setQuotes(q);
      setInvoices(inv);
    })();
  }, [router]);

  async function acceptQuote(id) {
    await updateQuote(id, { status: 'accepted' });
    setQuotes(quotes.map(q => (q.id === id ? { ...q, status: 'accepted' } : q)));
  }

  const filteredVehicles = vehicles
    .filter(v => !v.fleet_id)
    .filter(v => {
      const q = query.toLowerCase();
      return (
        (brand === 'All' || v.make === brand) &&
        (v.licence_plate.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q))
      );
    });

  const invFiltered = invoices.filter(i =>
    filter === 'all' ? true : i.status === filter
  );

  if (!client) return <p className="p-8">Loading…</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-teal-800 p-6 space-y-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-white">Welcome {client.first_name}</h1>
        <Link href="/local/request-job" className="button">New Job Request</Link>
      </header>

      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
        <input
          placeholder="Search vehicles..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="input flex-1 mb-4 md:mb-0"
        />
        <select
          value={brand}
          onChange={e => setBrand(e.target.value)}
          className="input"
        >
          {brandOptions.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map(v => (
          <Card key={v.id} className="hover:shadow-xl transition-shadow">
            <div className="p-4">
              <h2 className="text-xl font-medium">{v.licence_plate}</h2>
              <p className="text-sm text-gray-200">{v.make} {v.model}</p>
              <Link href={`/vehicles/${v.id}`} className="button-secondary mt-3 inline-block text-center">View Details</Link>
            </div>
          </Card>
        ))}
      </div>
      <section>
        <h2 className="text-xl font-semibold mb-2">Open Jobs</h2>
        <ul className="list-disc ml-6">
          {jobs.map(j => (
            <li key={j.id}>Job #{j.id} - {j.status}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Quotes</h2>
        <ul className="list-disc ml-6">
          {quotes.map(q => (
            <li key={q.id} className="mb-1">
              Quote #{q.id} - {q.status}
              {q.status !== 'accepted' && (
                <button onClick={() => acceptQuote(q.id)} className="ml-2 underline">
                  Accept
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Invoices</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input mb-2">
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <ul className="list-disc ml-6">
          {invFiltered.map(inv => (
            <li key={inv.id}>Invoice #{inv.id} - {inv.status}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
