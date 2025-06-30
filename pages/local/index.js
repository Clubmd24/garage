import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchVehicles } from '../../lib/vehicles';
import { fetchInvoices } from '../../lib/invoices';
import { PortalDashboard } from '../../components/PortalDashboard';

export default function LocalDashboard() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);

  async function handleLogout() {
    try {
      await fetch('/api/portal/local/logout', { credentials: 'include' });
      await fetch('/api/auth/logout', { credentials: 'include' });
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
        fetch(`/api/jobs?customer_id=${c.id}`).then(r => r.json()),
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
      <div className="p-4 text-right">
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
      />
    </>
  );
}
