// pages/office/clients/[id].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../../components/Layout';

const EditClientPage = () => {
  const { id } = useRouter().query;
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    landline: '',
    nie_number: '',
    street_address: '',
    town: '',
    province: '',
    post_code: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/clients/${id}`)
      .then(r => r.json())
      .then(data => setForm(data))
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      router.push('/office/clients');
    } catch {
      setError('Failed to update');
    }
  };

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  if (loading) return <Layout><p>Loading…</p></Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Edit Client</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        {[
          'first_name',
          'last_name',
          'email',
          'mobile',
          'landline',
          'nie_number',
          'street_address',
          'town',
          'province',
          'post_code',
        ].map(field => (
          <div key={field}>
            <label className="block mb-1">{field.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
            <input
              name={field}
              value={form[field] || ''}
              onChange={change}
              className="w-full border px-3 py-2 rounded text-black"
            />
          </div>
        ))}
        <button type="submit" className="btn">Update</button>
      </form>
    </Layout>
  );
};

export default EditClientPage;
