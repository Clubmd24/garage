import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../../components/Layout';

const NewFleetPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    company_name: '',
    account_rep: '',
    payment_terms: '',
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
      router.push('/office/fleets');
    } catch {
      setError('Failed to create fleet');
    }
  };

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">New Fleet</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        {['company_name','account_rep','payment_terms'].map(field => (
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
        <button type="submit" className="button">Save</button>
      </form>
    </Layout>
  );
};

export default NewFleetPage;

