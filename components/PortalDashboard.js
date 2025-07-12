import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from './Card';
import { updateQuote } from '../lib/quotes';
import { fetchJobStatuses } from '../lib/jobStatuses.js';
import { fetchInvoiceStatuses } from '../lib/invoiceStatuses.js';
import { formatDateTime } from '../lib/datetime.js';

export function computeDueDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

export function PortalDashboard({
  title,
  requestJobPath,
  vehicles = [],
  jobs = [],
  quotes = [],
  setQuotes,
  invoices = [],
  vehicleFilter = () => true,
  vehicleLinkBase = '/vehicles',
}) {
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('All');
  const [filter, setFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [statuses, setStatuses] = useState([]);
  const [invoiceStatuses, setInvoiceStatuses] = useState([]);

  useEffect(() => {
    fetchJobStatuses()
      .then(setStatuses)
      .catch(() => setStatuses([]));
    fetchInvoiceStatuses()
      .then(setInvoiceStatuses)
      .catch(() => setInvoiceStatuses([]));
  }, []);

  async function acceptQuote(id) {
    await updateQuote(id, { status: 'accepted' });
    let jobId = null;
    const qObj = quotes.find(q => q.id === id);
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
        await updateQuote(id, { job_id: jobId });
      }
    }
    setQuotes(
      quotes.map(q =>
        q.id === id ? { ...q, status: 'accepted', job_id: jobId ?? q.job_id } : q
      )
    );
  }

  const filteredVehicles = vehicles
    .filter(vehicleFilter)
    .filter(v => {
      const q = query.toLowerCase();
      return (
        (brand === 'All' || v.make === brand) &&
        (v.licence_plate.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q))
      );
    });

  const visibleIds = new Set(filteredVehicles.map(v => v.id));

  const quotesFiltered = quotes.filter(q =>
    !q.vehicle_id || visibleIds.has(q.vehicle_id)
  );

  const brandOptions = [
    'All',
    ...Array.from(new Set(vehicles.filter(vehicleFilter).map(v => v.make))),
  ];

  const baseVehicles = vehicles.filter(vehicleFilter);
  const now = new Date();
  const soon = new Date();
  soon.setDate(now.getDate() + 30);

  const upcomingService = baseVehicles
    .map(v => ({ vehicle: v, due: computeDueDate(v.service_date) }))
    .filter(({ due }) => due && due >= now && due <= soon);

  const upcomingItv = baseVehicles
    .map(v => ({ vehicle: v, due: computeDueDate(v.itv_date) }))
    .filter(({ due }) => due && due >= now && due <= soon);

  const jobsFiltered = jobs.filter(j =>
    jobFilter === 'all' ? true : j.status === jobFilter
  );

  const invFiltered = invoices.filter(i =>
    filter === 'all' ? true : (i.status || '').toLowerCase() === filter.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-teal-800 p-6 space-y-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <Link href={requestJobPath} className="button">New Job Request</Link>
      </header>

      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
        <input
          placeholder="Search vehicles..."
          value={query}
          onChange={e => setQuery(e.target.value)} className="input flex-1 mb-4 md:mb-0"
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
              <p className="text-sm text-black">{v.make} {v.model}</p>
              <p className="text-sm text-black">Service Date: {v.service_date || 'N/A'}</p>
              <p className="text-sm text-black">ITV Date: {v.itv_date || 'N/A'}</p>
              <Link href={`${vehicleLinkBase}/${v.id}`} className="button-secondary mt-3 inline-block text-center">View Details</Link>
            </div>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-2">Upcoming Service &amp; ITV</h2>
        {upcomingService.length === 0 && upcomingItv.length === 0 ? (
          <p>No vehicles due in next 30 days.</p>
        ) : (
          <ul className="list-disc ml-6">
            {upcomingService.map(({ vehicle, due }) => (
              <li key={`service-${vehicle.id}`}>
                {vehicle.licence_plate} - Service due {due.toISOString().slice(0, 10)}
              </li>
            ))}
            {upcomingItv.map(({ vehicle, due }) => (
              <li key={`itv-${vehicle.id}`}>
                {vehicle.licence_plate} - ITV due {due.toISOString().slice(0, 10)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Open Jobs</h2>
        <select
          value={jobFilter}
          onChange={e => setJobFilter(e.target.value)}
          className="input mb-2"
        >
          <option value="all">All</option>
          {statuses.map(s => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>
        <ul className="list-disc ml-6">
          {jobsFiltered.map(j => (
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
        <h2 className="text-xl font-semibold mb-2">Quotes</h2>
        <ul className="list-disc ml-6">
          {quotesFiltered.map(q => {
            const veh = vehicles.find(v => v.id === q.vehicle_id);
            return (
              <li key={q.id} className="mb-1">
                Quote #{q.id}
                {veh ? ` - ${veh.licence_plate}` : ''} - {q.status}
                {q.status !== 'accepted' && (
                  <button onClick={() => acceptQuote(q.id)} className="ml-2 underline">
                    Accept
                  </button>
                )}
                <a
                  href={`/api/quotes/${q.id}/pdf`}
                  target="_blank"
                  rel="noopener"
                  className="ml-2 underline"
                >
                  View PDF
                </a>
                <a
                  href={`/api/quotes/${q.id}/pdf`}
                  download
                  className="ml-2 underline"
                >
                  Download PDF
                </a>
              </li>
            );
          })}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Invoices</h2>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="input mb-2"
        >
          <option value="all">All</option>
          {invoiceStatuses.map(s => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
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
