import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchQuotes, updateQuote } from '../../../lib/quotes';
import { createInvoice } from '../../../lib/invoices';
import { useCurrentUser } from '../../../components/useCurrentUser.js';

const JobCardsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useCurrentUser();

  const load = () => {
    setLoading(true);
    fetchQuotes()
      .then(q =>
        setJobs(q.filter(j => j.status === 'job-card' || j.status === 'completed' || j.status === 'invoiced'))
      )
      .catch(() => setError('Failed to load job cards'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const completeJob = async job => {
    const mileageStr = prompt('Current mileage');
    const mileage = Number.parseInt(mileageStr, 10);
    if (!Number.isFinite(mileage)) return;
    await fetch('/api/vehicle-mileage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicle_id: job.vehicle_id, mileage }),
    });
    await updateQuote(job.id, { status: 'completed' });
    load();
  };

  const startJob = async job => {
    if (!job.job_id) return;
    await fetch(`/api/jobs/${job.job_id}/start`, { method: 'POST' });
  };

  const finishJob = async job => {
    if (!job.job_id) return;
    await fetch(`/api/jobs/${job.job_id}/finish`, { method: 'POST' });
  };

  const invoice = async job => {
    await createInvoice({
      quote_id: job.id, // Use quote_id to trigger createInvoiceFromQuote
      amount: job.total_amount,
      due_date: new Date().toISOString().substring(0, 10),
      status: 'issued',
    });
    await updateQuote(job.id, { status: 'invoiced' });
    load();
  };

  const getClientName = (job) => {
    if (job.first_name || job.last_name) {
      return `${job.first_name || ''} ${job.last_name || ''}`.trim();
    }
    return 'Unknown Client';
  };

  const getVehicleInfo = (job) => {
    const parts = [];
    if (job.licence_plate) parts.push(job.licence_plate);
    if (job.make) parts.push(job.make);
    if (job.model) parts.push(job.model);
    if (job.color) parts.push(job.color);
    return parts.join(' - ') || 'No Vehicle Info';
  };

  const filteredJobs = jobs.filter(j => {
    const q = searchQuery.toLowerCase();
    const clientName = getClientName(j).toLowerCase();
    const vehicleInfo = getVehicleInfo(j).toLowerCase();
    return (
      clientName.includes(q) ||
      vehicleInfo.includes(q) ||
      String(j.id).includes(q) ||
      (j.status || '').toLowerCase().includes(q)
    );
  });

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Job Cards</h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input mb-4 w-full"
          />
          <div className="grid gap-4 sm:grid-cols-2">
          {filteredJobs.map(j => (
            <div key={j.id} className="item-card">
              <h2 className="font-semibold mb-1">
                {j.job_id ? (
                  <Link href={`/office/jobs/${j.job_id}`} className="underline">
                    Job #{j.job_id}
                  </Link>
                ) : (
                  <span>Job not created</span>
                )}
              </h2>
              <p className="text-sm font-medium text-gray-700">{getClientName(j)}</p>
              <p className="text-sm text-gray-600">{getVehicleInfo(j)}</p>
              {user?.role?.toLowerCase() !== 'engineer' && (
                <p className="text-sm">Total: €{j.total_amount}</p>
              )}
              <p className="text-sm capitalize">Status: {j.status}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {j.job_id && (
                  <>
                    <button
                      onClick={() => startJob(j)}
                      className="button px-4 text-sm"
                    >
                      Start Job
                    </button>
                    <button
                      onClick={() => finishJob(j)}
                      className="button px-4 text-sm"
                    >
                      Finish Job
                    </button>
                  </>
                )}
                {j.status === 'job-card' && (
                  <button
                    onClick={() => completeJob(j)}
                    className="button px-4 text-sm"
                  >
                    Mark Completed
                  </button>
                )}
                {j.status === 'completed' && (
                  <button
                    onClick={() => invoice(j)}
                    className="button px-4 text-sm"
                  >
                    Generate Invoice
                  </button>
                )}
              </div>
            </div>
          ))}
          </div>
        </>
      )}
    </OfficeLayout>
  );
};

export default JobCardsPage;
