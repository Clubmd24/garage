import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { fetchQuotes } from '../lib/quotes';
import { fetchJobs } from '../lib/jobs';
import { fetchInvoices } from '../lib/invoices';
import { fetchJobStatuses } from '../lib/jobStatuses';

export default function OfficeDashboard() {
  const [quotes, setQuotes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    Promise.all([fetchQuotes(), fetchJobs(), fetchInvoices(), fetchJobStatuses()])
      .then(([q, j, i, s]) => {
        setQuotes(q);
        setJobs(j);
        setInvoices(i);
        setStatuses(s);
      })
      .catch(() => null);
  }, []);

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
      if (counts[j.status] !== undefined) counts[j.status] += 1;
    });
    return counts;
  }, [jobs, statuses]);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/office/quotations/new" className="button px-8 text-lg">Create Quote</Link>
        <Link href="/office/jobs/new" className="button px-8 text-lg">New Job</Link>
        <Link href="/office/invoices?status=unpaid" className="button px-8 text-lg">Pay Invoice</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white text-black rounded-2xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Open Quotes</h2>
          <p className="text-4xl font-bold text-blue-600">{openQuotes.length}</p>
        </div>
        <div className="bg-white text-black rounded-2xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Jobs</h2>
          <ul className="text-sm space-y-1">
            {statuses.map(s => (
              <li key={s.id} className="capitalize">{s.name}: {jobStatusCounts[s.name] || 0}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white text-black rounded-2xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Unpaid Invoices</h2>
          <p className="text-4xl font-bold text-blue-600">{unpaidInvoices.length}</p>
        </div>
      </div>
    </>
  );
}
