import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

const EditEngineerPage = () => {
  const { id } = useRouter().query;
  const [form, setForm] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/engineers/${id}`)
      .then(r => r.json())
      .then(data => setForm(data))
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/engineers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      router.push('/office/engineers');
    } catch {
      setError('Failed to update');
    }
  };

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Edit Engineer</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        {['username', 'email'].map(field => (
          <div key={field}>
            <label className="block mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              name={field}
              value={form[field] || ''}
              onChange={change}
              className="w-full border px-3 py-2 rounded text-black"
              required={field === 'username'}
            />
          </div>
        ))}
        <div>
          <label className="block mb-1">New Password</label>
          <input
            type="password"
            name="password"
            onChange={change}
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="button">Update</button>
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

export default EditEngineerPage;
