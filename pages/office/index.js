import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

function ClientsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <circle cx="12" cy="7" r="4" />
      <path d="M4 22c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}

function CRMIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M4 4h16v16H4z" />
      <path d="M9 22V9h6v13" />
    </svg>
  );
}

function EngineersIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M12 2v6M12 22v-6M4 12h6M20 12h-6" />
      <circle cx="12" cy="12" r="4" />
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

function JobCardsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M4 4h16v16H4z" />
      <path d="M8 8h8v8H8z" />
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

function PartsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <circle cx="12" cy="12" r="3" />
      <path d="M4 12h5M15 12h5M12 4v5M12 15v5" />
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

function ReportingIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M4 20h16" />
      <path d="M6 16v4M10 12v8M14 8v12M18 4v16" />
    </svg>
  );
}

function SchedulingIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M6 4h12v16H6z" />
      <path d="M8 2v4M16 2v4M6 8h12" />
    </svg>
  );
}

function VehiclesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M3 13l2-3h14l2 3v5H3z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) throw new Error('Auth failed');
        setUser(await res.json());
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { user, loading };
}

function DashboardCard({ href, title, Icon }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-blue-400 text-white font-bold rounded-full py-6 px-6 shadow-2xl transform hover:scale-105 transition-transform duration-300"
    >
      <Icon />
      <span className="text-lg">{title}</span>
    </Link>
  );
}

export default function OfficeHome() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { credentials: 'include' });
    } finally {
      router.push('/login');
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
        <title>Garage Vision - Office</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white space-y-8 p-6">
        <img src="/logo.png" alt="Garage Vision Logo" width={120} height={120} className="mb-4 rounded-full shadow-lg" />
        <h1 className="text-6xl font-bold tracking-tight">Garage Vision</h1>
        <p className="text-xl opacity-90">Welcome, {user.username}!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-xl">
          <DashboardCard href="/office/clients" title="Clients" Icon={ClientsIcon} />
          <DashboardCard href="/office/crm" title="CRM" Icon={CRMIcon} />
          <DashboardCard href="/office/engineers" title="Engineers" Icon={EngineersIcon} />
          <DashboardCard href="/office/invoices" title="Invoices" Icon={InvoicesIcon} />
          <DashboardCard href="/office/job-cards" title="Job Cards" Icon={JobCardsIcon} />
          <DashboardCard href="/office/job-management" title="Job Management" Icon={JobManagementIcon} />
          <DashboardCard href="/office/parts" title="Parts" Icon={PartsIcon} />
          <DashboardCard href="/office/quotations" title="Quotations" Icon={QuotationsIcon} />
          <DashboardCard href="/office/reporting" title="Reporting" Icon={ReportingIcon} />
          <DashboardCard href="/office/scheduling" title="Scheduling" Icon={SchedulingIcon} />
          <DashboardCard href="/office/vehicles" title="Vehicles" Icon={VehiclesIcon} />
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
