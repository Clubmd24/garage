import React, { useEffect, useState } from 'react';
import OfficeLayout from '../../components/OfficeLayout';

export default function SmtpSettingsPage() {
  const [form, setForm] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    secure: false,
    from_name: '',
    from_email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/company/smtp-settings')
      .then(r => (r.ok ? r.json() : null))
      .then(data => data && setForm({
        host: data.host || '',
        port: data.port || '',
        username: data.username || '',
        password: data.password || '',
        secure: !!data.secure,
        from_name: data.from_name || '',
        from_email: data.from_email || '',
      }))
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.host || !form.port || !form.from_email) {
      setError('Host, port and from email are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/company/smtp-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          port: Number(form.port),
          secure: !!form.secure,
        }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <OfficeLayout>
      <p>Loading…</p>
    </OfficeLayout>
  );

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">SMTP Settings</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Host</label>
          <input
            name="host"
            value={form.host}
            onChange={change}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Port</label>
          <input
            name="port"
            type="number"
            value={form.port}
            onChange={change}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Username</label>
          <input
            name="username"
            value={form.username}
            onChange={change}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={change}
            className="input w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="secure"
            type="checkbox"
            checked={form.secure}
            onChange={e => setForm(f => ({ ...f, secure: e.target.checked }))}
          />
          <label htmlFor="secure" className="mb-0">Secure Connection</label>
        </div>
        <div>
          <label className="block mb-1">From Name</label>
          <input
            name="from_name"
            value={form.from_name}
            onChange={change}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">From Email</label>
          <input
            name="from_email"
            value={form.from_email}
            onChange={change}
            className="input w-full"
          />
        </div>
        <button type="submit" className="button" disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </OfficeLayout>
  );
}
