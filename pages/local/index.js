import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { fetchVehicles } from '../../lib/vehicles';
import { fetchInvoices } from '../../lib/invoices';
import { fetchJobs } from '../../lib/jobs.js';
import { PortalDashboard } from '../../components/PortalDashboard';
import logout from '../../lib/logout.js';

export default function LocalDashboard() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/local/login');
    }
  }

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/portal/local/me');
      if (!res.ok) return router.replace('/local/login');
      const c = await res.json();
      setClient(c);
      const [veh, j, q, inv] = await Promise.all([
        fetchVehicles(c.id, null),
        fetchJobs({ customer_id: c.id, status: 'in progress' }),
        fetch(`/api/quotes?customer_id=${c.id}`).then(r => r.json()),
        fetch(`/api/invoices?customer_id=${c.id}`).then(r => r.json()),
      ]);
      setVehicles(veh);
      setJobs(j);
      setQuotes(q);
      setInvoices(inv);
    })();
  }, [router]);

  if (!client) return <p className="p-8">Loading…</p>;

  return (
    <>
      <div className="p-4 flex justify-end space-x-2">
        <Link href="/local/profile" className="button-secondary px-4">
          My Profile
        </Link>
        <button onClick={handleLogout} className="button-secondary px-4">Logout</button>
      </div>
      <PortalDashboard
        title={`Welcome ${client.first_name}`}
        requestJobPath="/local/request-job"
        vehicles={vehicles.filter(v => !v.fleet_id)}
        jobs={jobs}
        quotes={quotes}
        setQuotes={setQuotes}
        invoices={invoices}
        vehicleLinkBase="/local/vehicles"
      />
    </>
  );
}
