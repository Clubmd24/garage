import { useEffect, useState } from 'react';
import Head from 'next/head';
import { DashboardCard } from '../../components/DashboardCard.js';
import { useRouter } from 'next/router';
import logout from '../../lib/logout.js';

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

  useEffect(() => {
    if (!loading && !fleet) router.replace('/fleet/login');
  }, [loading, fleet, router]);

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
        <img src="/logo.png" alt="Garage Vision Logo" width={120} height={120} className="mb-4 rounded-full shadow-lg" />
        <h1 className="text-6xl font-bold tracking-tight">Fleet Portal</h1>
        <p className="text-xl opacity-90">Welcome, {fleet.company_name}!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-xl">
          <DashboardCard href="/fleet" title="Vehicles" Icon={VehiclesIcon} />
          <DashboardCard href="/fleet" title="Invoices" Icon={InvoicesIcon} />
          <DashboardCard href="/fleet" title="Quotes" Icon={QuotationsIcon} />
          <DashboardCard href="/fleet" title="Jobs in progress" Icon={JobManagementIcon} />
          <DashboardCard href="/fleet" title="Request new quotation" Icon={RequestIcon} />
          <DashboardCard href="/fleet/request-job" title="Book a job" Icon={JobManagementIcon} />
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
