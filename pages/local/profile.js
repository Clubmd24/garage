import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import logout from '../../lib/logout.js';

export default function LocalProfile() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/portal/local/me');
      if (!res.ok) return router.replace('/local/login');
      const c = await res.json();
      setClient(c);
      setForm(c);
    })();
  }, [router]);

  if (!form) return <p className="p-8">Loading…</p>;

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/local/login');
    }
  }

  const submit = async e => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/portal/local/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) setMessage('Saved');
  };

  const fields = [
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
    'garage_name',
    'vehicle_reg',
    'password',
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <button onClick={handleLogout} className="button-secondary px-4">Logout</button>
      </div>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        {fields.map(f => (
          <div key={f}>
            <label className="block mb-1">
              {f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </label>
            <input
              type={f === 'password' ? 'password' : 'text'}
              name={f}
              value={form[f] || ''}
              onChange={change}
              className="w-full border px-3 py-2 rounded text-black"
            />
          </div>
        ))}
        <button type="submit" className="button">Save</button>
      </form>
    </div>
  );
}
