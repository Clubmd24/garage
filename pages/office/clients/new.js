// pages/office/clients/new.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';

const NewClientPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState(null);
  const router = useRouter();

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      router.push('/office/clients');
    } catch {
      setError('Failed to create client');
    }
  };

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">New Client</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        {['name','email','phone'].map(field => (
          <div key={field}>
            <label className="block mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              name={field}
              value={form[field]}
              onChange={change}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        ))}
        <button type="submit" className="btn">Save</button>
      </form>
    </Layout>
  );
};

export default NewClientPage;
