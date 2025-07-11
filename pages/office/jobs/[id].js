import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchEngineers } from '../../../lib/engineers';
import { fetchJobStatuses } from '../../../lib/jobStatuses.js';

export default function JobViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [client, setClient] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [form, setForm] = useState({
    status: '',
    engineer_id: '',
    scheduled_start: '',
    scheduled_end: '',
  });

  useEffect(() => {
    fetchEngineers()
      .then(setEngineers)
      .catch(() => setEngineers([]));
    fetchJobStatuses()
      .then(setStatuses)
      .catch(() => setStatuses([]));
  }, []);

  const formatEuro = n =>
    new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(
      n || 0
    );

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error();
        const j = await res.json();
        setJob(j);
        setForm({
          status: j.status || '',
          engineer_id:
            Array.isArray(j.assignments) && j.assignments.length > 0
              ? j.assignments[0].user_id
              : '',
          scheduled_start: j.scheduled_start
            ? j.scheduled_start.slice(0, 16)
            : '',
          scheduled_end: j.scheduled_end ? j.scheduled_end.slice(0, 16) : '',
        });
        if (j.customer_id) {
          const c = await fetch(`/api/clients/${j.customer_id}`);
          if (c.ok) setClient(await c.json());
        }
        if (j.vehicle) {
          setVehicle(j.vehicle);
        } else if (j.vehicle_id) {
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

  const change = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    try {
      if (form.engineer_id) {
        const res = await fetch(`/api/jobs/${id}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            engineer_id: form.engineer_id,
            scheduled_start: form.scheduled_start,
            ...(form.scheduled_end ? { scheduled_end: form.scheduled_end } : {}),
          }),
        });
        if (!res.ok) throw new Error();
      }
      if (form.status) {
        const res = await fetch(`/api/jobs/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: form.status }),
        });
        if (!res.ok) throw new Error();
      }
      const r = await fetch(`/api/jobs/${id}`);
      if (r.ok) setJob(await r.json());
    } catch {
      setError('Failed to update');
    }
  };

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
          {vehicle && (
            <div className="ml-4 text-sm space-y-1">
              <p>Make: {vehicle.make || 'N/A'}</p>
              <p>Model: {vehicle.model || 'N/A'}</p>
              <p>VIN: {vehicle.vin_number || 'N/A'}</p>
            </div>
          )}
          <p>
            <strong>Engineers:</strong>{' '}
            {Array.isArray(job.assignments) && job.assignments.length > 0
              ? job.assignments.map(a => a.username || a.user_id).join(', ')
              : 'Unassigned'}
          </p>
          <p>
            <strong>Scheduled:</strong>{' '}
            {job.scheduled_start
              ? new Date(job.scheduled_start).toLocaleString()
              : 'N/A'}{' '}
            -{' '}
            {job.scheduled_end
              ? new Date(job.scheduled_end).toLocaleString()
              : 'N/A'}
          </p>
          <div className="mt-4">
            <Link href={`/office/jobs/assign?id=${id}`} className="button">
              {job.assignments && job.assignments.length > 0
                ? 'Edit Assignment'
                : 'Assign Engineer'}
            </Link>
          </div>
          <form onSubmit={submit} className="space-y-2 max-w-sm mt-4">
            <div>
              <label className="block mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={change}
                className="input w-full"
              >
                <option value="">Select…</option>
                {statuses.map(s => (
                  <option key={s.id} value={s.name} className="capitalize">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Engineer</label>
              <select
                name="engineer_id"
                value={form.engineer_id}
                onChange={change}
                className="input w-full"
              >
                <option value="">Select…</option>
                {engineers.map(e => (
                  <option key={e.id} value={e.id}>{e.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Scheduled Start</label>
              <input
                type="datetime-local"
                name="scheduled_start"
                value={form.scheduled_start}
                onChange={change}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Scheduled End</label>
              <input
                type="datetime-local"
                name="scheduled_end"
                value={form.scheduled_end}
                onChange={change}
                className="input w-full"
              />
            </div>
            <button type="submit" className="button">Save</button>
          </form>
          <p><strong>Notes:</strong> {job.notes || 'None'}</p>
          {job.quote && job.quote.defect_description && (
            <p className="mt-2">
              <strong>Reported Defect:</strong> {job.quote.defect_description}
            </p>
          )}
          {job.quote && Array.isArray(job.quote.items) && job.quote.items.length > 0 && (
            <div className="mt-4">
              <h2 className="font-semibold mb-1">Quote Items</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Part</th>
                    <th className="text-left">Qty</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {job.quote.items.map(it => (
                    <tr key={it.id}>
                      <td>{it.partNumber || ''} {it.description}</td>
                      <td>{it.qty}</td>
                      <td className="text-right">{formatEuro(it.unit_price)}</td>
                      <td className="text-right">{formatEuro(it.qty * it.unit_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </OfficeLayout>
  );
}
