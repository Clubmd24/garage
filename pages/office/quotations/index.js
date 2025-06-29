import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../../components/Layout';
import { fetchQuotes, updateQuote } from '../../../lib/quotes';

const QuotationsPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    fetchQuotes()
      .then(setQuotes)
      .catch(() => setError('Failed to load quotes'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const approve = async id => {
    await updateQuote(id, { status: 'approved' });
    load();
  };

  const convert = async id => {
    await updateQuote(id, { status: 'job-card' });
    load();
  };

  const visible = quotes.filter(
    q => !['job-card', 'completed', 'invoiced'].includes(q.status)
  );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Quotations</h1>
        <Link href="/office/quotations/new" className="button px-4 text-sm">
          Create New Quote
        </Link>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map(q => (
            <div key={q.id} className="item-card">
              <h2 className="font-semibold mb-1">Quote #{q.id}</h2>
              <p className="text-sm">Client ID: {q.customer_id}</p>
              <p className="text-sm">Total: €{q.total_amount}</p>
              <p className="text-sm capitalize">Status: {q.status}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {q.status !== 'approved' && q.status !== 'job-card' && (
                  <button
                    onClick={() => approve(q.id)}
                    className="button px-4 text-sm"
                  >
                    Approve
                  </button>
                )}
                {q.status === 'approved' && (
                  <button
                    onClick={() => convert(q.id)}
                    className="button px-4 text-sm"
                  >
                    Create Job Card
                  </button>
                )}
                <a
                  href={`/api/quotes/${q.id}/pdf`}
                  className="button-secondary px-4 text-sm"
                >
                  Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default QuotationsPage;
