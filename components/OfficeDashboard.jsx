import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { fetchQuotes } from '../lib/quotes';
import { fetchJobs } from '../lib/jobs';
import { fetchInvoices } from '../lib/invoices';
import { JOB_STATUSES } from '../lib/jobStatuses';
import logout from '../lib/logout.js';

export default function OfficeDashboard() {
  const router = useRouter();
  const [quotes, setQuotes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([fetchQuotes(), fetchJobs(), fetchInvoices()])
      .then(([q, j, i]) => {
        setQuotes(q);
        setJobs(j);
        setInvoices(i);
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
    JOB_STATUSES.forEach(s => {
      counts[s] = 0;
    });
    jobs.forEach(j => {
      if (counts[j.status] !== undefined) counts[j.status] += 1;
    });
    return counts;
  }, [jobs]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/login');
    }
  }

  return (
    <div className="min-h-screen flex text-white bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <aside className="w-64 bg-blue-900 p-6 space-y-6">
        <nav className="space-y-4">
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2">Sales</h3>
            <ul className="space-y-1">
              <li><Link href="/office/quotations/new" className="block hover:underline">New Quotation</Link></li>
              <li><Link href="/office/invoices" className="block hover:underline">Invoices</Link></li>
              <li><Link href="/office/invoices?status=unpaid" className="block hover:underline">Pay Invoice</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2">Operations</h3>
            <ul className="space-y-1">
              <li><Link href="/office/jobs/new" className="block hover:underline">New Job</Link></li>
              <li><Link href="/office/job-requests" className="block hover:underline">Job Requests</Link></li>
              <li><Link href="/office/job-management" className="block hover:underline">Job Management</Link></li>
              <li><Link href="/office/job-cards" className="block hover:underline">Job Cards</Link></li>
              <li><Link href="/office/scheduling" className="block hover:underline">Scheduling</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2">CRM</h3>
            <ul className="space-y-1">
              <li><Link href="/office/clients" className="block hover:underline">Clients</Link></li>
              <li><Link href="/office/engineers" className="block hover:underline">Engineers</Link></li>
              <li><Link href="/office/crm" className="block hover:underline">CRM</Link></li>
              <li><Link href="/office/reporting" className="block hover:underline">Reporting</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2">Assets</h3>
            <ul className="space-y-1">
              <li><Link href="/office/parts" className="block hover:underline">Parts</Link></li>
              <li><Link href="/office/fleets" className="block hover:underline">Fleets</Link></li>
              <li><Link href="/office/vehicles" className="block hover:underline">Vehicles</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2">Settings</h3>
            <ul className="space-y-1">
              <li><Link href="/office/company-settings" className="block hover:underline">Company Settings</Link></li>
              <li><button onClick={handleLogout} className="w-full text-left hover:underline">Logout</button></li>
            </ul>
          </div>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-blue-700 p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Garage Vision" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl font-bold">Garage Vision</h1>
          </div>
          <input type="text" placeholder="Search…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input w-full" />
        </header>
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
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
                {JOB_STATUSES.map(s => (
                  <li key={s} className="capitalize">{s}: {jobStatusCounts[s] || 0}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white text-black rounded-2xl p-4 shadow">
              <h2 className="text-lg font-semibold mb-2">Unpaid Invoices</h2>
              <p className="text-4xl font-bold text-blue-600">{unpaidInvoices.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
