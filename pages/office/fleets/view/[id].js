import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import OfficeLayout from '../../../../components/OfficeLayout';
import { PortalDashboard } from '../../../../components/PortalDashboard';
import { fetchVehicles } from '../../../../lib/vehicles';
import { fetchJobs } from '../../../../lib/jobs';

export default function FleetViewPage() {
  const router = useRouter();
  const { id, pin } = router.query;
  const [fleet, setFleet] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/fleets/${id}`);
        if (!res.ok) throw new Error();
        const f = await res.json();
        setFleet(f);
        const [v, j, q, i] = await Promise.all([
          fetchVehicles(null, id),
          fetchJobs({ fleet_id: id, status: 'in progress' }),
          fetch(`/api/quotes?fleet_id=${id}`).then(r => r.json()),
          fetch(`/api/invoices?fleet_id=${id}`).then(r => r.json()),
        ]);
        setVehicles(v);
        setJobs(j);
        setQuotes(q);
        setInvoices(i);
      } catch (err) {
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const deleteFleet = async () => {
    if (!confirm('Delete this fleet?')) return;
    await fetch(`/api/fleets/${id}`, { method: 'DELETE' });
    router.push('/office/fleets');
  };

  if (loading) return (
    <OfficeLayout>
      <p>Loading…</p>
    </OfficeLayout>
  );
  if (error) return (
    <OfficeLayout>
      <p className="text-red-500">{error}</p>
    </OfficeLayout>
  );

  return (
    <OfficeLayout>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href={`/office/fleets/${id}`} className="button">Edit Fleet</Link>
        <button onClick={deleteFleet} className="button bg-red-600 hover:bg-red-700">Delete Fleet</button>
        <Link href="/office/fleets" className="button">Back to Fleets</Link>
      </div>
      {pin && <p className="mb-4 font-semibold">PIN: {pin}</p>}
      <PortalDashboard
        title={`${fleet.company_name} Dashboard`}
        requestJobPath={`/office/jobs/new?fleet_id=${id}`}
        vehicles={vehicles}
        jobs={jobs}
        quotes={quotes}
        setQuotes={setQuotes}
        invoices={invoices}
        vehicleLinkBase="/office/vehicles/view"
      />
    </OfficeLayout>
  );
}
