import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';

export default function JobViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [client, setClient] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error();
        const j = await res.json();
        setJob(j);
        if (j.customer_id) {
          const c = await fetch(`/api/clients/${j.customer_id}`);
          if (c.ok) setClient(await c.json());
        }
        if (j.vehicle_id) {
          const v = await fetch(`/api/vehicles/${j.vehicle_id}`);
          if (v.ok) setVehicle(await v.json());
        }
      } catch (err) {
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;
  if (error) return <OfficeLayout><p className="text-red-500">{error}</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Job #{id}</h1>
      {job && (
        <div className="space-y-2 text-black">
          <p><strong>Status:</strong> {job.status}</p>
          <p>
            <strong>Client:</strong>{' '}
            {client ? (
              <Link href={`/office/clients/${client.id}`} className="underline">
                {client.first_name} {client.last_name}
              </Link>
            ) : (
              'N/A'
            )}
          </p>
          <p>
            <strong>Vehicle:</strong>{' '}
            {vehicle ? (
              <Link href={`/office/vehicles/view/${vehicle.id}`} className="underline">
                {vehicle.licence_plate}
              </Link>
            ) : (
              'N/A'
            )}
          </p>
          <p>
            <strong>Engineers:</strong>{' '}
            {Array.isArray(job.assignments) && job.assignments.length > 0
              ? job.assignments.map(a => a.username || a.user_id).join(', ')
              : 'Unassigned'}
          </p>
          <p><strong>Notes:</strong> {job.notes || 'None'}</p>
        </div>
      )}
    </OfficeLayout>
  );
}
