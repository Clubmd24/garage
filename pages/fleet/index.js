import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import logout from '../../lib/logout.js';
import { fetchVehicles } from '../../lib/vehicles';
import { fetchInvoices } from '../../lib/invoices';
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
        fetch(`/api/jobs?fleet_id=${f.id}`).then(r => r.json()),
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
    <>
      <div className="p-4 text-right">
        <button onClick={handleLogout} className="button-secondary px-4">Logout</button>
      </div>
      <PortalDashboard
        title={`${fleet.company_name} Dashboard`}
        requestJobPath="/fleet/request-job"
        vehicles={vehicles}
        jobs={jobs}
        quotes={quotes}
        setQuotes={setQuotes}
        invoices={invoices}
      />
    </>
  );
}
