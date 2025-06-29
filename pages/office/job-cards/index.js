import React, { useEffect, useState } from 'react';
import { Layout } from '../../../components/Layout';
import { fetchQuotes, updateQuote } from '../../../lib/quotes';
import { createInvoice } from '../../../lib/invoices';

const JobCardsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    fetchQuotes()
      .then(q =>
        setJobs(q.filter(j => j.status === 'job-card' || j.status === 'completed'))
      )
      .catch(() => setError('Failed to load job cards'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const completeJob = async id => {
    await updateQuote(id, { status: 'completed' });
    load();
  };

  const invoice = async job => {
    await createInvoice({
      job_id: job.id,
      customer_id: job.customer_id,
      amount: job.total_amount,
      due_date: new Date().toISOString().substring(0, 10),
      status: 'issued',
    });
    await updateQuote(job.id, { status: 'invoiced' });
    load();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Job Cards</h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map(j => (
            <div key={j.id} className="item-card">
              <h2 className="font-semibold mb-1">Job #{j.id}</h2>
              <p className="text-sm">Client ID: {j.customer_id}</p>
              <p className="text-sm">Total: €{j.total_amount}</p>
              <p className="text-sm capitalize">Status: {j.status}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {j.status === 'job-card' && (
                  <button
                    onClick={() => completeJob(j.id)}
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
      )}
    </Layout>
  );
};

export default JobCardsPage;
