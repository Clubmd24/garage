import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';
import PartsArrivedModal from '../../../components/office/PartsArrivedModal.jsx';
import { fetchJobs, fetchJob, markPartsArrived } from '../../../lib/jobs';
import { fetchEngineers } from '../../../lib/engineers';
import { fetchJobStatuses } from '../../../lib/jobStatuses';

export default function JobManagementPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [forms, setForms] = useState({});
  const [error, setError] = useState(null);
  const [partsModal, setPartsModal] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    const qStatus = router.query.status ? String(router.query.status) : '';
    setStatusFilter(qStatus);
  }, [router.isReady, router.query.status]);

  useEffect(() => {
    async function load() {
      try {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        const all = await fetchJobs(params);
        const list = all.filter(j => j.status !== 'completed');
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
      try {
        const stats = await fetchJobStatuses();
        setStatuses(stats);
      } catch {
        setStatuses([]);
      }
    }
    load();
  }, [statusFilter]);

  const change = (id, field, value) =>
    setForms(f => ({ ...f, [id]: { ...f[id], [field]: value } }));

  const assign = async id => {
    const data = forms[id] || {};
    let scheduled_end = '';
    if (data.duration && data.scheduled_start) {
      const start = new Date(data.scheduled_start);
      if (!Number.isNaN(start.getTime())) {
        const end = new Date(start.getTime() + Number(data.duration) * 60000);
        scheduled_end = end.toISOString().slice(0, 16);
      }
    }
    try {
      const res = await fetch(`/api/jobs/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineer_id: data.engineer_id,
          scheduled_start: data.scheduled_start,
          scheduled_end,
          duration: data.duration,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await fetchJob(id);
      setJobs(j => j.map(job => (job.id === id ? { ...job, ...updated } : job)));
    } catch {
      setError('Failed to assign job');
    }
  };

  const markPartsHere = async id => {
    try {
      await markPartsArrived(id);
      const updated = await fetchJob(id);
      setJobs(j =>
        j.map(job =>
          job.id === id ? { ...job, ...updated, partsHere: true } : job
        )
      );
    } catch {
      setError('Failed to update job');
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
      const updated = await fetchJob(id);
      setJobs(j => j.map(job => (job.id === id ? { ...job, ...updated } : job)));
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
      {partsModal && (
        <PartsArrivedModal
          onScheduleNow={() => {
            assign(partsModal);
            setPartsModal(null);
          }}
          onScheduleLater={() => {
            markPartsHere(partsModal);
            setPartsModal(null);
          }}
        />
      )}
      <h1 className="text-xl font-semibold mb-4">Jobs</h1>
      <div className="mb-4">
        <label className="block text-white text-sm">Status</label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input"
          aria-label="Status Filter"
        >
          <option value="">All</option>
          {statuses.map(s => (
            <option key={s.id ?? s.name} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <div className="space-y-6">
          {jobs.map(job => {
            return (
              <div key={job.id} className="space-y-2 bg-white text-black p-4 rounded">
                <p className="font-semibold">Job #{job.id}</p>
                <p className="text-sm">Status: {job.status}</p>
                {job.partsHere && (
                  <p className="text-green-600 font-bold">PARTS HERE</p>
                )}
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
                <div className="flex gap-2">
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
                  {job.status === 'awaiting parts' && (
                    <button
                      onClick={() => setPartsModal(job.id)}
                      className="button px-4"
                    >
                      Parts Arrived
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </OfficeLayout>
  );
}
