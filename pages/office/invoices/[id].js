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
      
      {/* Basic Invoice Info */}
      <div className="bg-white text-black p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Invoice Details</h2>
        <p><strong>Amount:</strong> €{invoice.amount}</p>
        <p><strong>Status:</strong> {invoice.status}</p>
        {invoice.due_date && <p><strong>Due:</strong> {invoice.due_date}</p>}
      </div>

      {/* Client Information */}
      {invoice.client && (
        <div className="bg-white text-black p-4 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">Client Information</h2>
          <p><strong>Name:</strong> {invoice.client.first_name} {invoice.client.last_name}</p>
          {invoice.client.email && <p><strong>Email:</strong> {invoice.client.email}</p>}
          {invoice.client.phone && <p><strong>Phone:</strong> {invoice.client.phone}</p>}
          {invoice.client.address && <p><strong>Address:</strong> {invoice.client.address}</p>}
        </div>
      )}

      {/* Vehicle Information */}
      {invoice.vehicle && (
        <div className="bg-white text-black p-4 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">Vehicle Information</h2>
          <p><strong>License Plate:</strong> {invoice.vehicle.licence_plate}</p>
          <p><strong>Make:</strong> {invoice.vehicle.make}</p>
          <p><strong>Model:</strong> {invoice.vehicle.model}</p>
          {invoice.vehicle.color && <p><strong>Color:</strong> {invoice.vehicle.color}</p>}
          {invoice.vehicle.year && <p><strong>Year:</strong> {invoice.vehicle.year}</p>}
        </div>
      )}

      {/* Defect Description */}
      {invoice.defect_description && (
        <div className="bg-white text-black p-4 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">Reported Defect</h2>
          <p>{invoice.defect_description}</p>
        </div>
      )}

      {/* Invoice Items */}
      {invoice.items && invoice.items.length > 0 && (
        <div className="bg-white text-black p-4 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">Invoice Items</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Description</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map(item => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.description}</td>
                  <td className="text-center py-2">{item.qty}</td>
                  <td className="text-right py-2">€{Number(item.unit_price).toFixed(2)}</td>
                  <td className="text-right py-2">€{Number(item.line_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Terms */}
      {invoice.terms && (
        <div className="bg-white text-black p-4 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">Terms & Conditions</h2>
          <p className="whitespace-pre-wrap">{invoice.terms}</p>
        </div>
      )}
    </OfficeLayout>
  );
}
