import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchVehicles } from '../../lib/vehicles';
import { fetchInvoices } from '../../lib/invoices';
import { PortalDashboard } from '../../components/PortalDashboard';
import { FleetNav } from '../../components/FleetNav';

export default function LocalDashboard() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);

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
    <div className="flex space-x-4">
      <FleetNav />
      <div className="flex-1">
        <PortalDashboard
          title={`Welcome ${client.first_name}`}
          requestJobPath="/local/request-job"
          vehicles={vehicles.filter(v => !v.fleet_id)}
          jobs={jobs}
          quotes={quotes}
          setQuotes={setQuotes}
          invoices={invoices}
        />
      </div>
    </div>
  );
}
