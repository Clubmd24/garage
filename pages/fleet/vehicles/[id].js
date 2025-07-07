import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import logout from '../../../lib/logout.js';
import { fetchJobs } from '../../../lib/jobs.js';
import { updateQuote } from '../../../lib/quotes.js';

export default function FleetVehicleDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [fleet, setFleet] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch('/api/portal/fleet/me');
      if (!res.ok) return router.replace('/fleet/login');
      const f = await res.json();
      setFleet(f);
      const [v, qAll, jAll, iAll] = await Promise.all([
        fetch(`/api/vehicles/${id}`).then(r => r.json()),
        fetch(`/api/quotes?fleet_id=${f.id}`).then(r => r.json()),
        fetchJobs({ fleet_id: f.id }),
        fetch(`/api/invoices?fleet_id=${f.id}`).then(r => r.json()),
      ]);
      setVehicle(v);
      setQuotes(qAll.filter(q => q.vehicle_id == id));
      setJobs(jAll.filter(j => j.vehicle_id == id));
      setInvoices(iAll.filter(inv => inv.vehicle_id == id));
    })();
  }, [id, router]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/fleet/login');
    }
  }

  async function acceptQuote(qid) {
    await updateQuote(qid, { status: 'accepted' });
    setQuotes(quotes.map(q => (q.id === qid ? { ...q, status: 'accepted' } : q)));
  }

  async function rejectQuote(qid) {
    await updateQuote(qid, { status: 'rejected' });
    setQuotes(quotes.map(q => (q.id === qid ? { ...q, status: 'rejected' } : q)));
  }

  if (!fleet || !vehicle) return <p className="p-8">Loading…</p>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Vehicle Details</h1>
        <button onClick={handleLogout} className="button-secondary px-4">Logout</button>
      </div>
      <Link href="/fleet/vehicles" className="button inline-block mb-4">
        Back to Vehicles
      </Link>
      <div className="mb-6 space-y-1">
        <p><strong>Plate:</strong> {vehicle.licence_plate}</p>
        <p><strong>Make:</strong> {vehicle.make}</p>
        <p><strong>Model:</strong> {vehicle.model}</p>
        <p><strong>Color:</strong> {vehicle.color}</p>
        <p><strong>Service Date:</strong> {vehicle.service_date || 'N/A'}</p>
        <p><strong>ITV Date:</strong> {vehicle.itv_date || 'N/A'}</p>
      </div>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Quotes</h2>
        <ul className="list-disc ml-6 space-y-1">
          {quotes.map(q => (
            <li key={q.id}>
              Quote #{q.id} - {q.status}
              {q.status !== 'accepted' && (
                <button onClick={() => acceptQuote(q.id)} className="ml-2 underline">Accept</button>
              )}
              {q.status !== 'rejected' && (
                <button onClick={() => rejectQuote(q.id)} className="ml-2 underline">Reject</button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Jobs</h2>
        <ul className="list-disc ml-6 space-y-1">
          {jobs.map(j => (
            <li key={j.id}>Job #{j.id} - {j.status}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Invoices</h2>
        <ul className="list-disc ml-6 space-y-1">
          {invoices.map(inv => (
            <li key={inv.id}>Invoice #{inv.id} - {inv.status}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
