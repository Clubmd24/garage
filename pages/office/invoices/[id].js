import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

export default function InvoiceViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/invoices/${id}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setInvoice)
      .catch(() => setError('Failed to load invoice'));
  }, [id]);

  if (error) return <OfficeLayout><p className="text-red-500">{error}</p></OfficeLayout>;
  if (!invoice) return <OfficeLayout><p>Loading…</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <div className="mb-6 flex flex-wrap gap-4">
        <a href={`/api/invoices/${id}/pdf`} className="button px-4 text-sm">Download PDF</a>
        <button onClick={() => router.back()} className="button-secondary px-4 text-sm">Back</button>
      </div>
      <h1 className="text-2xl font-semibold mb-4">Invoice #{invoice.id}</h1>
      <p><strong>Amount:</strong> €{invoice.amount}</p>
      <p><strong>Status:</strong> {invoice.status}</p>
      {invoice.due_date && <p><strong>Due:</strong> {invoice.due_date}</p>}
      {invoice.terms && <p className="whitespace-pre-wrap mt-4">{invoice.terms}</p>}
    </OfficeLayout>
  );
}
