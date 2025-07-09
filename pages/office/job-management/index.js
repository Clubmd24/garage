import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchJobs } from '../../../lib/jobs';
import { fetchEngineers } from '../../../lib/engineers';

export default function JobManagementPage() {
  const [jobs, setJobs] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [forms, setForms] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs({ status: 'unassigned' })
      .then(setJobs)
      .catch(() => setJobs([]));
    fetchEngineers()
      .then(setEngineers)
      .catch(() => setEngineers([]));
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
                    required
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
                </div>
              </form>
            );
          })}
        </div>
      )}
    </OfficeLayout>
  );
}
