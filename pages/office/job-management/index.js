import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchJobs, fetchJob } from '../../../lib/jobs';
import { fetchEngineers } from '../../../lib/engineers';

export default function JobManagementPage() {
  const [jobs, setJobs] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [forms, setForms] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchJobs({ status: 'unassigned' });
        const withDetails = await Promise.all(
          list.map(async j => {
            try {
              const full = await fetchJob(j.id);
              return { ...j, vehicle: full.vehicle, quote: full.quote };
            } catch {
              return j;
            }
          })
        );
        setJobs(withDetails);
      } catch {
        setJobs([]);
      }
      try {
        const engs = await fetchEngineers();
        setEngineers(engs);
      } catch {
        setEngineers([]);
      }
    }
    load();
  }, []);

  const change = (id, field, value) =>
    setForms(f => ({ ...f, [id]: { ...f[id], [field]: value } }));

  const assign = async id => {
    const data = forms[id] || {};
    try {
      const res = await fetch(`/api/jobs/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineer_id: data.engineer_id,
          scheduled_start: data.scheduled_start,
          scheduled_end: data.scheduled_end,
        }),
      });
      if (!res.ok) throw new Error();
      setJobs(j => j.filter(job => job.id !== id));
    } catch {
      setError('Failed to assign job');
    }
  };

  const markAwaitingParts = async id => {
    try {
      const res = await fetch(`/api/jobs/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ awaiting_parts: true }),
      });
      if (!res.ok) throw new Error();
      setJobs(j => j.filter(job => job.id !== id));
    } catch {
      setError('Failed to update job');
    }
  };

  const deleteJob = async id => {
    if (!confirm('Delete this job?')) return;
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    setJobs(j => j.filter(job => job.id !== id));
  };

  return (
    <OfficeLayout>
      <h1 className="text-xl font-semibold mb-4">Unassigned Jobs</h1>
      {error && <p className="text-red-500">{error}</p>}
      {jobs.length === 0 ? (
        <p>No unassigned jobs.</p>
      ) : (
        <div className="space-y-6">
          {jobs.map(job => {
            const f = forms[job.id] || {};
            return (
              <form
                key={job.id}
                onSubmit={e => {
                  e.preventDefault();
                  assign(job.id);
                }}
                className="space-y-2 bg-white text-black p-4 rounded"
              >
                <p className="font-semibold">Job #{job.id}</p>
                {job.vehicle && (
                  <>
                    <p className="text-sm">{job.vehicle.licence_plate}</p>
                    <p className="text-sm">
                      {job.vehicle.make} {job.vehicle.model}
                    </p>
                  </>
                )}
                {job.quote?.defect_description && (
                  <p className="text-sm">{job.quote.defect_description}</p>
                )}
                {job.quote && Array.isArray(job.quote.items) && job.quote.items.length > 0 && (
                  <table className="text-sm w-full mb-2">
                    <thead>
                      <tr>
                        <th className="text-left">Part #</th>
                        <th className="text-left">Description</th>
                        <th className="text-right">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.quote.items.map(it => (
                        <tr key={it.id}>
                          <td>{it.partNumber || ''}</td>
                          <td>{it.description}</td>
                          <td className="text-right">{it.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div>
                  <label className="block mb-1">Engineer</label>
                  <select
                    value={f.engineer_id || ''}
                    onChange={e => change(job.id, 'engineer_id', e.target.value)}
                    className="input w-full"
                    required
                  >
                    <option value="">Select…</option>
                    {engineers.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Scheduled Start</label>
                  <input
                    type="datetime-local"
                    value={f.scheduled_start || ''}
                    onChange={e => change(job.id, 'scheduled_start', e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Scheduled End</label>
                  <input
                    type="datetime-local"
                    value={f.scheduled_end || ''}
                    onChange={e => change(job.id, 'scheduled_end', e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="button px-4">
                    Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => markAwaitingParts(job.id)}
                    className="button-secondary px-4"
                  >
                    Awaiting Parts
                  </button>
                  <Link
                    href={`/office/jobs/${job.id}`}
                    className="button-secondary px-4"
                  >
                    View Job
                  </Link>
                  <Link
                    href={`/office/jobs/${job.id}/purchase-orders`}
                    className="button-secondary px-4"
                  >
                    Purchase Orders
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteJob(job.id)}
                    className="button bg-red-600 hover:bg-red-700 px-4"
                  >
                    Delete
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      )}
    </OfficeLayout>
  );
}
