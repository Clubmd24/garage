import React, { useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

const NewEngineerPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const router = useRouter();

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/engineers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      router.push('/office/engineers');
    } catch {
      setError('Failed to create engineer');
    }
  };

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">New Engineer</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        {['username', 'email', 'password'].map(field => (
          <div key={field}>
            <label className="block mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type={field === 'password' ? 'password' : 'text'}
              name={field}
              value={form[field]}
              onChange={change}
              className="w-full border px-3 py-2 rounded text-black"
              {...(field === 'password' ? { required: true } : { required: field === 'username' })}
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

export default NewEngineerPage;
