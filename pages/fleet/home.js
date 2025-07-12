import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { DashboardCard } from '../../components/DashboardCard.js';
import { useRouter } from 'next/router';
import Link from 'next/link';
import logout from '../../lib/logout.js';
import { fetchQuotes } from '../../lib/quotes';
import { fetchJobs } from '../../lib/jobs';
import { fetchInvoices } from '../../lib/invoices';
import { fetchJobStatuses } from '../../lib/jobStatuses';

function VehiclesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M3 13l2-3h14l2 3v5H3z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function InvoicesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M6 2h12v20H6z" />
      <path d="M9 6h6M9 10h6M9 14h3" />
    </svg>
  );
}

function QuotationsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M6 6h12v12H6z" />
      <path d="M9 9h6M9 13h4" />
    </svg>
  );
}

function JobManagementIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  );
}

function RequestIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}



function useCurrentFleet() {
  const [fleet, setFleet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/portal/fleet/me');
        if (!res.ok) throw new Error('Auth failed');
        setFleet(await res.json());
      } catch {
        setFleet(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { fleet, loading };
}

export default function FleetHome() {
  const router = useRouter();
  const { fleet, loading } = useCurrentFleet();
  const [quotes, setQuotes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const openQuotes = useMemo(
    () =>
      quotes.filter(
        q => !['job-card', 'completed', 'invoiced'].includes(q.status)
      ),
    [quotes]
  );

  const unpaidInvoices = useMemo(
    () =>
      invoices.filter(
        inv => (inv.status || '').toLowerCase() === 'unpaid'
      ),
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

  useEffect(() => {
    if (!loading && !fleet) router.replace('/fleet/login');
  }, [loading, fleet, router]);

  useEffect(() => {
    if (!fleet) return;
    Promise.all([
      fetch(`/api/quotes?fleet_id=${fleet.id}`).then(r => r.json()),
      fetchJobs({ fleet_id: fleet.id }),
      fetch(`/api/invoices?fleet_id=${fleet.id}`).then(r => r.json()),
      fetchJobStatuses(),
    ])
      .then(([q, j, i, s]) => {
        setQuotes(q);
        setJobs(j);
        setInvoices(i);
        setStatuses(s);
      })
      .catch(() => null);
  }, [fleet]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/fleet/login');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Fleet Portal</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white space-y-8 p-6">
        <Image
          src="/logo.png"
          alt="Garage Vision Logo"
          width={120}
          height={120}
          className="mb-4 rounded-full shadow-lg"
        />
        <h1 className="text-6xl font-bold tracking-tight">Fleet Portal</h1>
        <p className="text-xl opacity-90">Welcome, {fleet.company_name}!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-xl">
          <DashboardCard href="/fleet/vehicles" title="Vehicles" Icon={VehiclesIcon} />
          <DashboardCard href="/fleet/invoices" title="Invoices" Icon={InvoicesIcon} />
          <DashboardCard href="/fleet/quotes" title="Quotes" Icon={QuotationsIcon} />
          <DashboardCard href="/fleet/jobs" title="Jobs in progress" Icon={JobManagementIcon} />
          <DashboardCard href="/fleet/request-quotation" title="Request new quotation" Icon={RequestIcon} />
          <DashboardCard href="/fleet/request-job" title="Book a job" Icon={JobManagementIcon} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-xl">
          <div className="bg-white text-black rounded-2xl p-4 shadow text-center">
            <h2 className="text-lg font-semibold mb-2">Open Quotes</h2>
            <p className="text-4xl font-bold text-blue-600">
              <Link href="/fleet/quotes">{openQuotes.length}</Link>
            </p>
          </div>
          <div className="bg-white text-black rounded-2xl p-4 shadow text-center">
            <h2 className="text-lg font-semibold mb-2">Jobs</h2>
            <ul className="text-sm space-y-1">
              {statuses.map(s => (
                <li key={s.id} className="capitalize">
                  {s.name}:{' '}
                  <Link href={`/fleet/jobs?status=${encodeURIComponent(s.name)}`}>{jobStatusCounts[s.name] || 0}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white text-black rounded-2xl p-4 shadow text-center">
            <h2 className="text-lg font-semibold mb-2">Unpaid Invoices</h2>
            <p className="text-4xl font-bold text-blue-600">
              <Link href="/fleet/invoices">{unpaidInvoices.length}</Link>
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 bg-gray-200 text-red-600 rounded-full px-4 py-2 shadow hover:bg-gray-300"
        >
          Logout
        </button>
      </div>
    </>
  );
}
