import { useState } from 'react';
import Link from 'next/link';
import { Card } from './Card';
import { updateQuote } from '../lib/quotes';
import { JOB_STATUSES } from '../lib/jobStatuses.js';

export function PortalDashboard({
  title,
  requestJobPath,
  vehicles = [],
  jobs = [],
  quotes = [],
  setQuotes,
  invoices = [],
  vehicleFilter = () => true,
}) {
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('All');
  const [filter, setFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');

  async function acceptQuote(id) {
    await updateQuote(id, { status: 'accepted' });
    setQuotes(
      quotes.map(q => (q.id === id ? { ...q, status: 'accepted' } : q))
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

  const brandOptions = [
    'All',
    ...Array.from(new Set(vehicles.filter(vehicleFilter).map(v => v.make))),
  ];

  const jobsFiltered = jobs.filter(j =>
    jobFilter === 'all' ? true : j.status === jobFilter
  );

  const invFiltered = invoices.filter(i =>
    filter === 'all' ? true : i.status === filter
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
              <Link href={`/vehicles/${v.id}`} className="button-secondary mt-3 inline-block text-center">View Details</Link>
            </div>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-2">Open Jobs</h2>
        <select
          value={jobFilter}
          onChange={e => setJobFilter(e.target.value)}
          className="input mb-2"
        >
          <option value="all">All</option>
          {JOB_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <ul className="list-disc ml-6">
          {jobsFiltered.map(j => (
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
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="input mb-2"
        >
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
