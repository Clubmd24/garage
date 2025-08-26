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
  const [assignmentHistory, setAssignmentHistory] = useState({});

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
        
        // Load assignment history for each job
        const history = {};
        for (const job of withDetails) {
          try {
            const res = await fetch(`/api/jobs/${job.id}/assignments`);
            if (res.ok) {
              history[job.id] = await res.json();
            }
          } catch (err) {
            console.error(`Failed to load assignment history for job ${job.id}:`, err);
            history[job.id] = [];
          }
        }
        setAssignmentHistory(history);
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
      
      // Clear the form fields after successful assignment
      setForms(f => ({ ...f, [id]: {} }));
      
      // Reload assignment history
      try {
        const historyRes = await fetch(`/api/jobs/${id}/assignments`);
        if (historyRes.ok) {
          const history = await historyRes.json();
          setAssignmentHistory(h => ({ ...h, [id]: history }));
        }
      } catch (err) {
        console.error('Failed to reload assignment history:', err);
      }
    } catch {
      setError('Failed to assign job');
    }
  };

  const deleteAssignment = async (jobId, assignmentId) => {
    if (!confirm('Delete this assignment?')) return;
    
    try {
      const res = await fetch(`/api/jobs/${jobId}/assignments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id: assignmentId }),
      });
      
      if (!res.ok) throw new Error('Failed to delete assignment');
      
      // Reload assignment history
      const historyRes = await fetch(`/api/jobs/${jobId}/assignments`);
      if (historyRes.ok) {
        const history = await historyRes.json();
        setAssignmentHistory(h => ({ ...h, [jobId]: history }));
      }
    } catch (err) {
      console.error('Failed to delete assignment:', err);
      setError('Failed to delete assignment');
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
    try {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            const history = assignmentHistory[job.id] || [];
            const currentAssignment = history[0]; // Most recent assignment
            
            return (
              <div key={job.id} className="space-y-4 bg-white text-black p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Job #{job.id}</p>
                    <p className="text-sm">Status: {job.status}</p>
                    {job.client && (
                      <p className="text-sm font-medium text-blue-600">
                        Client: {job.client.first_name} {job.client.last_name}
                        {job.client.company_name && ` (${job.client.company_name})`}
                      </p>
                    )}
                    {job.vehicle && (
                      <p className="text-sm font-medium text-green-600">
                        Vehicle: {job.vehicle.licence_plate}
                      </p>
                    )}
                    {job.partsHere && (
                      <p className="text-green-600 font-bold">PARTS HERE</p>
                    )}
                  </div>
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
                
                {(job.vehicle || job.client) && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium">Client & Vehicle Information</p>
                    {job.client && (
                      <p className="text-sm font-medium text-blue-600">
                        {job.client.first_name} {job.client.last_name}
                        {job.client.company_name && ` (${job.client.company_name})`}
                      </p>
                    )}
                    {job.vehicle && (
                      <>
                        <p className="text-sm font-medium text-green-600">
                          {job.vehicle.licence_plate}
                        </p>
                        <p className="text-sm">
                          {job.vehicle.make} {job.vehicle.model} {job.vehicle.color}
                        </p>
                      </>
                    )}
                  </div>
                )}
                
                {job.quote?.defect_description && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium">Reported Defect</p>
                    <p className="text-sm">{job.quote.defect_description}</p>
                  </div>
                )}
                
                {/* Assigned Engineer Tile */}
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-2">Assigned Engineer</p>
                  
                  {/* Current Assignment Form */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                    <select
                      value={forms[job.id]?.engineer_id || ''}
                      onChange={e => change(job.id, 'engineer_id', e.target.value)}
                      className="input text-sm text-gray-900 bg-white border-gray-300"
                    >
                      <option value="">Select Engineer</option>
                      {engineers.map(eng => (
                        <option key={eng.id} value={eng.id} className="text-gray-900">
                          {eng.first_name} {eng.last_name}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="datetime-local"
                      placeholder="Scheduled Start"
                      value={forms[job.id]?.scheduled_start || ''}
                      onChange={e => change(job.id, 'scheduled_start', e.target.value)}
                      className="input text-sm text-gray-900 bg-white border-gray-300"
                    />
                    
                    <input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={forms[job.id]?.duration || ''}
                      onChange={e => change(job.id, 'duration', e.target.value)}
                      className="input text-sm text-gray-900 bg-white border-gray-300"
                    />
                    
                    <button
                      onClick={() => assign(job.id)}
                      className="button px-3 text-sm"
                      disabled={!forms[job.id]?.engineer_id}
                    >
                      Assign
                    </button>
                  </div>
                  
                  {/* Assignment History */}
                  {history.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-blue-800 mb-2">Assignment History</p>
                      <div className="space-y-2">
                        {history.map(assignment => (
                          <div key={assignment.id} className="flex justify-between items-center bg-white p-2 rounded border">
                            <div className="text-sm">
                              <span className="font-medium">
                                {assignment.first_name} {assignment.last_name}
                              </span>
                              <span className="text-gray-500 ml-2">
                                ({assignment.username})
                              </span>
                              <br />
                              <span className="text-xs text-gray-500">
                                Assigned: {formatDate(assignment.assigned_at)}
                              </span>
                            </div>
                            <button
                              onClick={() => deleteAssignment(job.id, assignment.id)}
                              className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
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
