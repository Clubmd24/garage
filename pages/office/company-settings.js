import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../components/Layout';

const S3_BASE_URL = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`;

export default function CompanySettingsPage() {
  const [form, setForm] = useState({
    logo_url: '',
    company_name: '',
    address: '',
    phone: '',
    website: '',
    social_links: '',
    terms: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/company-settings')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data) setForm(data);
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

  if (loading) return (
    <Layout>
      <p>Loading…</p>
    </Layout>
  );

  const fields = ['company_name', 'address', 'phone', 'website', 'social_links', 'terms'];

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-2">Company Settings</h1>
      <Link href="/office/document-templates" className="text-blue-600 underline mb-4 inline-block">
        View Document Templates
      </Link>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
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
    </Layout>
  );
}
