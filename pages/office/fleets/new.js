import React, { useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

const NewFleetPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    company_name: '',
    garage_name: '',
    account_rep: '',
    payment_terms: '',
    street_address: '',
    contact_number_1: '',
    contact_number_2: '',
    email_1: '',
    email_2: '',
    credit_limit: '',
    tax_number: '',
    contact_name_1: '',
    contact_name_2: '',
  });
  const [error, setError] = useState(null);

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fleets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      router.push(`/office/fleets/${created.id}?pin=${created.pin}`);
    } catch {
      setError('Failed to create fleet');
    }
  };

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">New Fleet</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        {[
          'company_name',
          'garage_name',
          'account_rep',
          'payment_terms',
          'street_address',
          'contact_number_1',
          'contact_number_2',
          'email_1',
          'email_2',
          'credit_limit',
          'tax_number',
          'contact_name_1',
          'contact_name_2',
        ].map(field => (
          <div key={field}>
            <label className="block mb-1">{field.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</label>
            <input
              name={field}
              value={form[field]}
              onChange={change}
              className="w-full border px-3 py-2 rounded text-black"
            />
          </div>
        ))}
        <div className="flex gap-2">
          <button type="submit" className="button">Save</button>
          <button
            type="button"
            onClick={() => router.back()}
            className="button-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </OfficeLayout>
  );
};

export default NewFleetPage;

