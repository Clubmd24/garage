import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { fetchVehicles } from '../../lib/vehicles';
import { fetchQuotes, updateQuote } from '../../lib/quotes';
import { fetchInvoices } from '../../lib/invoices';

export default function LocalDashboard() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('all');

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

  const invFiltered = invoices.filter(i =>
    filter === 'all' ? true : i.status === filter
  );

  if (!client) return <p className="p-8">Loading…</p>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Welcome {client.first_name}</h1>
      <Link href="/local/request-job" className="button">New Job Request</Link>
      <section>
        <h2 className="text-xl font-semibold mb-2">Vehicles</h2>
        <ul className="list-disc ml-6">
          {vehicles.filter(v => !v.fleet_id).map(v => (
            <li key={v.id}>{v.licence_plate} {v.make} {v.model}</li>
          ))}
        </ul>
      </section>
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
