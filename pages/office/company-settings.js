import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../components/OfficeLayout';

const S3_BASE_URL = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`;

export default function CompanySettingsPage() {
  const [form, setForm] = useState({
    logo_url: '',
    company_name: '',
    address: '',
    phone: '',
    website: '',
    social_links: '',
    bank_details: '',
    invoice_terms: '',
    quote_terms: '',
    terms: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [statusInput, setStatusInput] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/company-settings').then(r => (r.ok ? r.json() : null)),
      fetch('/api/job-statuses').then(r => (r.ok ? r.json() : [])),
    ])
      .then(([settings, statuses]) => {
        if (settings) setForm(settings);
        setStatuses(statuses);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = await fetch('/api/chat/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type, file_name: file.name }),
      });
      if (!r.ok) throw new Error('Failed to get upload URL');
      const { url, key } = await r.json();
      await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      setForm(f => ({ ...f, logo_url: `${S3_BASE_URL}/${key}` }));
    } catch (err) {
      console.error(err);
      setError('Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  }

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/company-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  async function addStatus(e) {
    e.preventDefault();
    const name = statusInput.trim();
    if (!name) return;
    const res = await fetch('/api/job-statuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const s = await res.json();
      setStatuses([...statuses, s]);
      setStatusInput('');
    }
  }

  async function removeStatus(id) {
    if (!confirm('Delete this status?')) return;
    await fetch(`/api/job-statuses/${id}`, { method: 'DELETE' });
    setStatuses(statuses.filter(s => s.id !== id));
  }

  if (loading) return (
    <OfficeLayout>
      <p>Loading…</p>
    </OfficeLayout>
  );

  const fields = [
    'company_name',
    'address',
    'phone',
    'website',
    'social_links',
    'bank_details',
    'invoice_terms',
    'quote_terms',
    'terms',
  ];

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-2">Company Settings</h1>
      <Link href="/office/document-templates" className="text-blue-600 underline mb-4 inline-block">
        View Document Templates
      </Link>
      <Link href="/office/user-roles" className="text-blue-600 underline mb-4 ml-4 inline-block">
        Manage User Roles
      </Link>
      <a href="/api/company/export-clients" className="text-blue-600 underline mb-4 ml-4 inline-block">
        Export Clients
      </a>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={submit} className="space-y-4 max-w-md md:flex-1">
        <div>
          <label className="block mb-1">Logo</label>
          {form.logo_url && (
            <img src={form.logo_url} alt="Logo" className="max-h-32 mb-2" />
          )}
          <input type="file" onChange={handleLogoUpload} disabled={uploading} />
        </div>
        {fields.map(field => (
          <div key={field}>
            <label className="block mb-1">
              {field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </label>
            {['address', 'social_links', 'terms'].includes(field) ? (
              <textarea
                name={field}
                value={form[field] || ''}
                onChange={change}
                className="input w-full"
                rows={field === 'address' ? 2 : 4}
              />
            ) : (
              <input
                name={field}
                value={form[field] || ''}
                onChange={change}
                className="input w-full"
              />
            )}
          </div>
        ))}
        <button type="submit" className="button" disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
      <div className="mt-8 md:mt-0 md:flex-1">
        <h2 className="text-xl font-semibold mb-2">Job Statuses</h2>
        <form onSubmit={addStatus} className="flex gap-2 mb-4">
          <input
            value={statusInput}
            onChange={e => setStatusInput(e.target.value)}
            className="input flex-1"
            placeholder="New status"
          />
          <button type="submit" className="button">Add</button>
        </form>
          <ul className="space-y-1">
            {statuses.map(s => (
              <li
                key={s.id}
                className="flex justify-between bg-gray-100 px-2 py-1 rounded text-black"
              >
                <span>{s.name}</span>
                {s.name !== 'unassigned' && s.name !== 'awaiting supplier information' && (
                  <button
                    onClick={() => removeStatus(s.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
      </div>
      </div>
    </OfficeLayout>
  );
}
