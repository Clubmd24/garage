// File: pages/dev/projects/new.js

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/Card';

export default function NewProject() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    if (!form.name) {
      setError('Missing required fields');
      return;
    }
    setLoading(true);

    const res = await fetch('/api/dev/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: form.name,
        description: form.description,
      }),
    });

    if (res.ok) {
      router.push('/dev/projects');
    } else if (res.status === 401) {
      router.replace('/login');
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || 'Server returned an error');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8">
          <Head><title>New Project – Dev Portal</title></Head>

          <h1 className="text-3xl font-bold mb-6 text-[var(--color-text-primary)]">
            Create New Project
          </h1>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input mt-1 h-32"
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <button type="submit" className="button" disabled={loading}>
                {loading ? 'Creating…' : 'Create Project'}
              </button>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}
