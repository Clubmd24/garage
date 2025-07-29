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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    const qStatus = router.query.status ? String(router.query.status) : '';
    setStatusFilter(qStatus);
  }, [router.isReady, router.query.status]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        
        console.log('Loading jobs with params:', params);
        const all = await fetchJobs(params);
        console.log('Fetched jobs:', all.length, all.map(j => ({ id: j.id, status: j.status })));
        
        // Filter out completed jobs - they're now in the invoice pipeline
        const activeJobs = all.filter(job => job.status !== 'completed');
        console.log('Active jobs (excluding completed):', activeJobs.length);
        
        // Don't filter out completed jobs - show all jobs based on filter
        const withDetails = await Promise.all(
          activeJobs.map(async j => {
            try {
              const full = await fetchJob(j.id);
              return { ...j, vehicle: full.vehicle, quote: full.quote };
            } catch {
              return j;
            }
          })
        );
        
        console.log('Jobs with details:', withDetails.length);
        setJobs(withDetails);
      } catch (err) {
        console.error('Error loading jobs:', err);
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
      
      setLoading(false);
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

  const markPartsHere = async (jobId) => {
    try {
      await fetch(`/api/jobs/${jobId}/parts-arrived`, { method: 'POST' });
      load();
    } catch (error) {
      console.error('Error marking parts arrived:', error);
    }
  };

  const completeJob = async (job) => {
    const mileageStr = prompt('Current mileage');
    const mileage = Number.parseInt(mileageStr, 10);
    if (!Number.isFinite(mileage)) return;
    
    try {
      // Update vehicle mileage
      await fetch('/api/vehicle-mileage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_id: job.vehicle_id, mileage }),
      });
  
      // Update job status to completed (this will trigger invoice creation)
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update job status');
      }
      
      const updatedJob = await res.json();
      console.log('Job completed successfully:', updatedJob);
      
      // Show payment modal if invoice was created
      if (updatedJob.invoice_id) {
        const payNow = confirm('Job completed! Invoice created. Would you like to process payment now? (OK for Pay Now, Cancel for Pay Later)');
        if (payNow) {
          window.location.href = `/office/epos?invoice_id=${updatedJob.invoice_id}&job_id=${job.id}`;
        } else {
          window.location.href = '/office/invoices?status=issued';
        }
      }
      
      load();
    } catch (error) {
      console.error('Error completing job:', error);
      alert('Failed to complete job. Please try again.');
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

  const handleStatusFilterChange = (e) => {
    const newFilter = e.target.value;
    console.log('Status filter changed to:', newFilter);
    setStatusFilter(newFilter);
    
    // Update URL query parameter
    const newQuery = { ...router.query };
    if (newFilter) {
      newQuery.status = newFilter;
    } else {
      delete newQuery.status;
    }
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true });
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
          onChange={handleStatusFilterChange}
          className="input"
          aria-label="Status Filter"
        >
          <option value="">All</option>
          {statuses.filter(s => s.name !== 'completed').map(s => (
            <option key={s.id ?? s.name} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found for status: {statusFilter || 'All'}</p>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-gray-300">Showing {jobs.length} job(s)</p>
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
                  {(job.status === 'unassigned' || job.status === 'awaiting parts') && (
                    <Link
                      href={`/office/jobs/${job.id}/purchase-orders`}
                      className="button-secondary px-4"
                    >
                      Purchase Orders
                    </Link>
                  )}
                  {job.status === 'awaiting parts' && (
                    <button
                      onClick={() => setPartsModal(job.id)}
                      className="button px-4"
                    >
                      Parts Arrived
                    </button>
                  )}
                  {job.status === 'ready for completion' && (
                    <button
                      onClick={() => completeJob(job)}
                      className="button px-4 bg-green-600 hover:bg-green-700"
                    >
                      ✅ Complete Job
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
