import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import PartsArrivedModal from '../../../components/office/PartsArrivedModal.jsx';
import { fetchJobs, fetchJob, markPartsArrived } from '../../../lib/jobs';
import { fetchEngineers } from '../../../lib/engineers';

export default function JobManagementPage() {
  const [jobs, setJobs] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [forms, setForms] = useState({});
  const [error, setError] = useState(null);
  const [partsModal, setPartsModal] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const all = await fetchJobs();
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
