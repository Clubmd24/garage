import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

export default function EditSupplierPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({
    name: '',
    address: '',
    contact_number: '',
    email_address: '',
    payment_terms: '',
    credit_limit: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/suppliers/${id}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setForm)
      .catch(() => setError('Failed to load supplier'));
  }, [id]);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    try {
      await fetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      router.push('/office/suppliers');
    } catch {
      setError('Failed to update supplier');
    }
  };

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Edit Supplier</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        {['name','address','contact_number','email_address','payment_terms','credit_limit'].map(field => (
          <div key={field}>
            <label className="block mb-1">{field.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</label>
            <input
              name={field}
              value={form[field] || ''}
              onChange={change}
              className="input w-full"
            />
          </div>
        ))}
        <button type="submit" className="button">Save</button>
      </form>
    </OfficeLayout>
  );
}
