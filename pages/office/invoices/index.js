import React, { useEffect, useState } from 'react';
import { Layout } from '../../../components/Layout';
import { fetchInvoices } from '../../../lib/invoices';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices()
      .then(setInvoices)
      .catch(() => setError('Failed to load invoices'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Invoices</h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {invoices.map(inv => (
            <div key={inv.id} className="item-card">
              <h2 className="font-semibold mb-1">Invoice #{inv.id}</h2>
              <p className="text-sm">Client ID: {inv.customer_id}</p>
              <p className="text-sm">Amount: €{inv.amount}</p>
              <p className="text-sm">Status: {inv.status}</p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default InvoicesPage;
