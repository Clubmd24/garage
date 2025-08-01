import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import logout from '../../../lib/logout.js';
import { fetchJobs } from '../../../lib/jobs.js';
import { updateQuote } from '../../../lib/quotes.js';
import { formatDateTime } from '../../../lib/datetime.js';

export default function LocalVehicleDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [client, setClient] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [mileage, setMileage] = useState([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch('/api/portal/local/me');
      if (!res.ok) return router.replace('/local/login');
      const c = await res.json();
      setClient(c);
      const [v, qAll, jAll, iAll, mAll] = await Promise.all([
        fetch(`/api/vehicles/${id}`).then(r => r.json()),
        fetch(`/api/quotes?customer_id=${c.id}`).then(r => r.json()),
        fetchJobs({ customer_id: c.id }),
        fetch(`/api/invoices?customer_id=${c.id}`).then(r => r.json()),
        fetch(`/api/vehicle-mileage?vehicle_id=${id}`).then(r => r.json()),
      ]);
      setVehicle(v);
      setQuotes(qAll.filter(q => q.vehicle_id == id));
      setJobs(jAll.filter(j => j.vehicle_id == id));
      setInvoices(iAll.filter(inv => inv.vehicle_id == id));
      setMileage(mAll);
    })();
  }, [id, router]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/local/login');
    }
  }

  async function acceptQuote(qid) {
    await updateQuote(qid, { status: 'accepted' });
    let jobId = null;
    const qObj = quotes.find(q => q.id === qid);
    if (qObj) {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: qObj.customer_id,
          fleet_id: qObj.fleet_id,
          vehicle_id: qObj.vehicle_id,
        }),
      });
      if (res.ok) {
        const job = await res.json();
        jobId = job.id;
        await updateQuote(qid, { job_id: jobId });
      }
    }
    setQuotes(
      quotes.map(q =>
        q.id === qid ? { ...q, status: 'accepted', job_id: jobId ?? q.job_id } : q
      )
    );
  }

  async function rejectQuote(qid) {
    await updateQuote(qid, { status: 'rejected' });
    setQuotes(quotes.map(q => (q.id === qid ? { ...q, status: 'rejected' } : q)));
  }

  if (!client || !vehicle) return <p className="p-8">Loading…</p>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Vehicle Details</h1>
        <button onClick={handleLogout} className="button-secondary px-4">Logout</button>
      </div>
      <Link href="/local" className="button inline-block mb-4">
        Back to Dashboard
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
        <h2 className="text-xl font-semibold mb-2">Mileage History</h2>
        {mileage.length === 0 ? (
          <p>No entries</p>
        ) : (
          <table className="min-w-full bg-white border text-black">
            <thead>
              <tr>
                <th className="px-2 py-1 border">Date</th>
                <th className="px-2 py-1 border">Mileage</th>
              </tr>
            </thead>
            <tbody>
              {mileage.map(m => (
                <tr key={m.id}>
                  <td className="px-2 py-1 border">{new Date(m.recorded_at).toLocaleDateString()}</td>
                  <td className="px-2 py-1 border">{m.mileage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
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
              <a
                href={`/api/quotes/${q.id}/pdf`}
                target="_blank"
                rel="noopener"
                className="ml-2 underline"
              >
                View PDF
              </a>
              <a href={`/api/quotes/${q.id}/pdf`} download className="ml-2 underline">
                Download PDF
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Jobs</h2>
        <ul className="list-disc ml-6 space-y-1">
          {jobs.map(j => (
            <li key={j.id}>
              Job #{j.id} - {j.status}
              {j.scheduled_start && (
                <> -{' '}
                  {j.scheduled_end
                    ? `Scheduled from ${formatDateTime(j.scheduled_start)} to ${formatDateTime(j.scheduled_end)}`
                    : `Scheduled for ${formatDateTime(j.scheduled_start)}`}
                </>
              )}
            </li>
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
