import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchQuotes } from '../../../lib/quotes';
import { fetchJobsForDate } from '../../../lib/jobs';
import { fetchInvoices } from '../../../lib/invoices';
import { fetchJobStatuses } from '../../../lib/jobStatuses.js';

const LiveScreenPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses, setStatuses] = useState([]);

  const load = () => {
    setLoading(true);
    const dateStr = new Date().toISOString().slice(0, 10);
    Promise.all([
      fetchQuotes(),
      fetchJobsForDate(dateStr),
      fetchInvoices(),
      fetchJobStatuses(),
    ])
      .then(([q, j, i, s]) => {
        setQuotes(q);
        setJobs(j);
        setInvoices(i);
        setStatuses(s);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openQuotes = useMemo(
    () => quotes.filter(q => !['job-card', 'completed', 'invoiced'].includes(q.status)),
    [quotes]
  );

  const unpaidInvoices = useMemo(
    () => invoices.filter(inv => (inv.status || '').toLowerCase() === 'unpaid'),
    [invoices]
  );

  const jobStatusCounts = useMemo(() => {
    const counts = {};
    statuses.forEach(s => {
      counts[s.name] = 0;
    });
    jobs.forEach(j => {
      const s = j.status;
      if (counts[s] !== undefined) counts[s] += 1;
    });
    return counts;
  }, [jobs, statuses]);

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Live Screen</h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-2">
              Open Quotes ({openQuotes.length})
            </h2>
            <ul className="space-y-1 max-h-60 overflow-y-auto">
              {openQuotes.map(q => (
                <li key={q.id}>Quote #{q.id} – {q.status}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-2">Jobs</h2>
            <ul className="space-y-1">
              {statuses.map(s => (
                <li key={s.id} className="capitalize">{s.name}: {jobStatusCounts[s.name] || 0}</li>
              ))}
            </ul>
            <ul className="space-y-1 max-h-60 overflow-y-auto mt-2">
              {jobs.map(j => (
                <li key={j.id}>
                  <Link href={`/office/jobs/${j.id}`} className="underline">
                    Job #{j.id} – {j.status}
                  </Link>
                  <div className="text-xs">
                    {j.scheduled_start
                      ? new Date(j.scheduled_start).toLocaleString()
                      : 'N/A'}{' '}
                    -{' '}
                    {j.scheduled_end
                      ? new Date(j.scheduled_end).toLocaleString()
                      : 'N/A'}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-2">
              Unpaid Invoices ({unpaidInvoices.length})
            </h2>
            <ul className="space-y-1 max-h-60 overflow-y-auto">
              {unpaidInvoices.map(inv => (
                <li key={inv.id}>Invoice #{inv.id}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </OfficeLayout>
  );
};

export default LiveScreenPage;
