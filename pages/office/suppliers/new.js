import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../../components/Layout';

export default function NewSupplierPage() {
  const [form, setForm] = useState({
    name: '',
    address: '',
    contact_number: '',
    email_address: '',
    payment_terms: '',
    credit_limit: '',
  });
  const [error, setError] = useState(null);
  const router = useRouter();

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      await res.json();
      router.push('/office/suppliers');
    } catch {
      setError('Failed to create supplier');
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">New Supplier</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        {['name','address','contact_number','email_address','payment_terms','credit_limit'].map(field => (
          <div key={field}>
            <label className="block mb-1">{field.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</label>
            <input
              name={field}
              value={form[field]}
              onChange={change}
              className="input w-full"
            />
          </div>
        ))}
        <button type="submit" className="button">Save</button>
      </form>
    </Layout>
  );
}
