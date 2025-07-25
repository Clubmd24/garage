import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import logout from '../../lib/logout.js';
import { fetchVehicles } from '../../lib/vehicles';
import { fetchInvoices } from '../../lib/invoices';
import { fetchJobs } from '../../lib/jobs.js';
import { PortalDashboard } from '../../components/PortalDashboard';

export default function FleetDashboard() {
  const router = useRouter();
  const [fleet, setFleet] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/fleet/login');
    }
  }

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/portal/fleet/me');
      if (!res.ok) return router.replace('/fleet/login');
      const f = await res.json();
      setFleet(f);
      const [veh, j, q, inv] = await Promise.all([
        fetchVehicles(null, f.id),
        fetchJobs({ fleet_id: f.id, status: 'in progress' }),
        fetch(`/api/quotes?fleet_id=${f.id}`).then(r => r.json()),
        fetch(`/api/invoices?fleet_id=${f.id}`).then(r => r.json()),
      ]);
      setVehicles(veh);
      setJobs(j);
      setQuotes(q);
      setInvoices(inv);
    })();
  }, [router]);


  if (!fleet) return <p className="p-8">Loading…</p>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="text-right mb-4">
        <button onClick={handleLogout} className="button-secondary px-4">Logout</button>
      </div>
      <Link href="/fleet/home" className="button inline-block mb-4">
        Return to Home
      </Link>
      <PortalDashboard
        title={`${fleet.company_name} Dashboard`}
        requestJobPath="/fleet/request-job"
        vehicles={vehicles}
        jobs={jobs}
        quotes={quotes}
        setQuotes={setQuotes}
        invoices={invoices}
        vehicleLinkBase="/fleet/vehicles"
      />
    </div>
  );
}
