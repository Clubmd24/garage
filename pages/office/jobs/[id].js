// pages/office/jobs/[id].js

import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { Card } from '../../../components/Card';
import SectionGrid from '../../../components/SectionGrid';
import { fetchEngineers } from '../../../lib/engineers';
import { fetchJobStatuses } from '../../../lib/jobStatuses';
import { fetchJob } from '../../../lib/jobs';
import { fetchClient } from '../../../lib/clients';
import { fetchVehicle } from '../../../lib/vehicles';

export default function JobViewPage() {
  const router = useRouter();
  const { id } = router.query;

  const [job, setJob] = useState(null);
  const [client, setClient] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [form, setForm] = useState({
    status: '',
    engineer_id: '',
    scheduled_start: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchJob(id),
      fetchEngineers(),
      fetchJobStatuses(),
    ])
      .then(async ([jobData, engs, stats]) => {
        setJob(jobData);
        setEngineers(engs);
        setStatuses(stats);

        setForm({
          status: jobData.status || '',
          engineer_id: jobData.engineer_id || '',
          scheduled_start: jobData.scheduled_start || '',
          notes: jobData.notes || '',
        });

        // initialize quotes if any
        setQuotes(Array.isArray(jobData.quote?.items) ? jobData.quote.items : []);

        // fetch related client
        if (jobData.customer_id) {
          setClient(await fetchClient(jobData.customer_id));
        }
        // fetch related vehicle
        if (jobData.vehicle_id) {
          setVehicle(await fetchVehicle(jobData.vehicle_id));
        }
      })
      .catch(() => setError('Failed to load job data'))
      .finally(() => setLoading(false));
  }, [id]);

  const change = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const deleteJob = async () => {
    if (!confirm('Delete this job?')) return;
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    router.push('/office/job-management');
  };

  const saveAll = async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setJob(await res.json());
    } catch {
      setError('Failed to save changes');
    }
  };

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;
  if (error)   return <OfficeLayout><p className="text-red-500">{error}</p></OfficeLayout>;

  return (
    <OfficeLayout>
      {job && (
        <>
          <SectionGrid>
            {/* SUMMARY */}
            <Card>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Job #{job.id}</h2>
                <button onClick={deleteJob} className="button bg-red-600 hover:bg-red-700">
                  Delete Job
                </button>
              </div>
              <p><strong>Status:</strong> {job.status}</p>
              <p>
                <strong>Client:</strong>{' '}
                {client
                  ? client.name ??
                    client.username ??
                    (client.first_name && client.last_name
                      ? `${client.first_name} ${client.last_name}`
                      : null) ??
                    client.company_name ??
                    'N/A'
                  : 'N/A'}
              </p>
              <p><strong>Vehicle:</strong> {vehicle?.licence_plate ?? 'N/A'}</p>
              <p>
                <strong>Scheduled:</strong>{' '}
                {form.scheduled_start
                  ? new Date(form.scheduled_start).toLocaleString()
                  : 'N/A'}
              </p>
              <p><strong>Reported Defect:</strong>{' '}
                {job.quote?.defect_description || 'N/A'}
              </p>
            </Card>

            {/* ASSIGN ENGINEER */}
            <Card>
              <h3 className="text-xl font-semibold mb-4">Assign Engineer</h3>
              <div className="space-y-4">
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
                      <option key={s.slug} value={s.slug}>{s.name}</option>
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
              </div>
            </Card>

            {/* NOTES */}
            <Card>
              <h3 className="text-xl font-semibold mb-4">Notes</h3>
              <textarea
                name="notes"
                value={form.notes}
                onChange={change}
                className="input w-full h-32 resize-none"
              />
            </Card>

            {/* QUOTE ITEMS (FULL-WIDTH) */}
            <div className="col-span-1 lg:col-span-2">
              <Card>
                <h3 className="text-xl font-semibold mb-4">Quote Items</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">Part</th>
                      <th>Qty</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map(item => {
                      const unit = Number(item.unit_price || item.unit_cost || 0).toFixed(2);
                      const qty = Number(item.qty || item.quantity || 0);
                      const total = (qty * Number(unit)).toFixed(2);
                      return (
                        <tr key={item.id}>
                          <td>{item.description || item.part_name || '—'}</td>
                          <td className="text-center">{qty}</td>
                          <td className="text-right">€{unit}</td>
                          <td className="text-right">€{total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="mt-6">
                  <Link
                    href={`/office/quotations/new?job_id=${id}`}
                    className="inline-block bg-blue-600 text-white rounded-full px-4 py-2"
                  >
                    + New Quote Item
                  </Link>
                </div>
              </Card>
            </div>
          </SectionGrid>

          {/* GLOBAL SAVE */}
          <div className="max-w-5xl mx-auto mt-6 flex justify-end">
            <button onClick={saveAll} className="button">Save Changes</button>
          </div>
        </>
      )}
    </OfficeLayout>
  );
}
