// pages/office/jobs/[id].js

import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { Card } from '../../../components/Card';
import SectionGrid from '../../../components/SectionGrid';
import PaymentModal from '../../../components/office/PaymentModal.jsx';
import JobHistory from '../../../components/office/JobHistory.jsx';
import { fetchEngineers } from '../../../lib/engineers';
import { fetchJobStatuses } from '../../../lib/jobStatuses';
import { fetchJob, assignJob } from '../../../lib/jobs';
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
    duration: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [previousStatus, setPreviousStatus] = useState('');

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
        setPreviousStatus(jobData.status || '');

        const duration =
          jobData.scheduled_start && jobData.scheduled_end
            ? Math.round(
                (new Date(jobData.scheduled_end) -
                  new Date(jobData.scheduled_start)) /
                  60000
              )
            : '';

        setForm({
          status: jobData.status || '',
          engineer_id: jobData.assignments?.[0]?.user_id || '',
          scheduled_start: jobData.scheduled_start
            ? jobData.scheduled_start.slice(0, 16)
            : '',
          duration: duration ? String(duration) : '',
          notes: jobData.notes || '',
        });

        setQuotes(Array.isArray(jobData.quote?.items) ? jobData.quote.items : []);

        if (jobData.customer_id) {
          setClient(await fetchClient(jobData.customer_id));
        }
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
      if (form.engineer_id) {
        await assignJob(id, {
          engineer_id: form.engineer_id,
          scheduled_start: form.scheduled_start,
          duration: form.duration,
        });
        setJob(await fetchJob(id));
      }
      const data = { ...form };
      delete data.engineer_id;
      delete data.duration;
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      
      const updatedJob = await res.json();
      setJob(updatedJob);
      
      // Check if status changed to 'completed'
      if (form.status === 'completed' && previousStatus !== 'completed') {
        setShowPaymentModal(true);
      }
      
      setPreviousStatus(form.status);
    } catch {
      setError('Failed to save changes');
    }
  };

  const handlePayNow = () => {
    setShowPaymentModal(false);
    // Redirect to EPOS page with invoice data
    router.push(`/office/epos?invoice_id=${job?.invoice_id}&job_id=${id}`);
  };

  const handlePayLater = () => {
    setShowPaymentModal(false);
    router.push('/office/invoices?status=issued');
  };

  const completeJob = async () => {
    try {
      // Update job status to completed (this will trigger invoice creation)
      const res = await fetch(`/api/jobs/${id}`, {
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
          window.location.href = `/office/epos?invoice_id=${updatedJob.invoice_id}&job_id=${id}`;
        } else {
          window.location.href = '/office/invoices?status=issued';
        }
      }
    } catch (error) {
      console.error('Error completing job:', error);
      alert('Failed to complete job. Please try again.');
    }
  };

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;
  if (error)   return <OfficeLayout><p className="text-red-500">{error}</p></OfficeLayout>;

  return (
    <OfficeLayout>
      {job && (
        <>
          {/* PIPELINE OVERVIEW */}
          <div className="max-w-5xl mx-auto mb-6">
            <Card>
              <h3 className="text-xl font-semibold mb-4">Pipeline Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quote Stage */}
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">📋</div>
                  <h4 className="font-medium mb-2">Quote</h4>
                  {job.quote ? (
                    <div className="space-y-1 text-sm">
                      <p>Quote #{job.quote.id}</p>
                      <p className="text-gray-600">{job.quote.status}</p>
                      <p className="text-green-600 font-medium">€{Number(job.quote.total_amount || 0).toFixed(2)}</p>
                      <a
                        href={`/api/quotes/${job.quote.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-blue-600 hover:underline text-xs"
                      >
                        View PDF
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No quote linked</p>
                  )}
                </div>

                {/* Job Stage */}
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <div className="text-2xl mb-2">🔧</div>
                  <h4 className="font-medium mb-2">Job</h4>
                  <div className="space-y-1 text-sm">
                    <p>Job #{job.id}</p>
                    <p className="text-blue-600 font-medium">{job.status}</p>
                    <p className="text-gray-600">Current Stage</p>
                  </div>
                </div>

                {/* Invoice Stage */}
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">💰</div>
                  <h4 className="font-medium mb-2">Invoice</h4>
                  {job.invoice_id ? (
                    <div className="space-y-1 text-sm">
                      <p>Invoice #{job.invoice_id}</p>
                      <p className="text-green-600 font-medium">Created</p>
                      <a
                        href={`/api/invoices/${job.invoice_id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-blue-600 hover:underline text-xs"
                      >
                        View PDF
                      </a>
                    </div>
                  ) : job.status === 'ready_for_completion' ? (
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-500">Ready to invoice</p>
                      <Link
                        href={`/office/invoices/new?job_id=${job.id}`}
                        className="inline-block text-blue-600 hover:underline text-xs"
                      >
                        Create Invoice
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Not ready yet</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

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
                <div>
                  <label className="block mb-1">Allocated Time (minutes)</label>
                  <input
                    type="number"
                    step="30"
                    min="30"
                    name="duration"
                    value={form.duration}
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
                      <th className="text-left">Part #</th>
                      <th className="text-left">Part</th>
                      <th>Qty</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map(item => {
                      const unit = Number(item.unit_price || item.unit_cost || 0).toFixed(2);
                      const qty  = Number(item.qty || item.quantity || 0);
                      const total= (qty * Number(unit)).toFixed(2);
                      return (
                        <tr key={item.id}>
                          <td>{item.partNumber || '—'}</td>
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

          {/* JOB HISTORY */}
          <div className="max-w-5xl mx-auto mt-6">
            <Card>
              <JobHistory jobId={id} />
            </Card>
          </div>

          {/* GLOBAL SAVE */}
          <div className="max-w-5xl mx-auto mt-6 flex justify-end gap-4">
            {job?.status === 'ready for completion' && (
              <button 
                onClick={completeJob} 
                className="button bg-green-600 hover:bg-green-700"
              >
                ✅ Complete Job
              </button>
            )}
            <button onClick={saveAll} className="button">Save Changes</button>
          </div>
        </>
      )}

      {/* PAYMENT MODAL */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPayNow={handlePayNow}
        onPayLater={handlePayLater}
        jobData={{
          id: job?.id,
          client: client,
          vehicle: vehicle,
          invoice_id: job?.invoice_id
        }}
      />
    </OfficeLayout>
  );
}
