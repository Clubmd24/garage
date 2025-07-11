import React, { useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';
import ClientAutocomplete from '../../../components/ClientAutocomplete';
import { createInvoice } from '../../../lib/invoices';

export default function NewInvoicePage() {
  const router = useRouter();
  const [clientName, setClientName] = useState('');
  const [form, setForm] = useState({
    customer_id: '',
    amount: '',
    due_date: '',
    status: 'issued',
    notes: '',
    terms: ''
  });
  const [error, setError] = useState(null);

  const submit = async e => {
    e.preventDefault();
    try {
      await createInvoice({
        customer_id: form.customer_id || null,
        amount: Number(form.amount) || 0,
        due_date: form.due_date || null,
        status: form.status || 'issued',
        notes: form.notes || null,
        terms: form.terms || null
      });
      router.push('/office/invoices');
    } catch {
      setError('Failed to create invoice');
    }
  };

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">New Invoice</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Client</label>
          <ClientAutocomplete
            value={clientName}
            onChange={v => {
              setClientName(v);
              setForm(f => ({ ...f, customer_id: '' }));
            }}
            onSelect={c => {
              setClientName(`${c.first_name || ''} ${c.last_name || ''}`.trim());
              setForm(f => ({ ...f, customer_id: c.id }));
            }}
          />
        </div>
        <div>
          <label className="block mb-1">Amount (€)</label>
          <input
            type="number"
            className="input w-full"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          />
        </div>
        <div>
          <label className="block mb-1">Due Date</label>
          <input
            type="date"
            className="input w-full"
            value={form.due_date}
            onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
          />
        </div>
        <div>
          <label className="block mb-1">Status</label>
          <select
            className="input w-full"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          >
            <option value="issued">Issued</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Notes</label>
          <textarea
            className="input w-full"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
        </div>
        <div>
          <label className="block mb-1">Terms</label>
          <textarea
            className="input w-full"
            value={form.terms}
            onChange={e => setForm(f => ({ ...f, terms: e.target.value }))}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="button">Create Invoice</button>
          <button type="button" onClick={() => router.back()} className="button-secondary">Cancel</button>
        </div>
      </form>
    </OfficeLayout>
  );
}
