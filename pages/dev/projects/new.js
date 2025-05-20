// File: pages/dev/projects/new.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/Card';

export default function NewProject() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('Not authenticated');
        return r.json();
      })
      .then(setUser)
      .catch(() => {
        router.replace('/login');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/dev/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        created_by: user?.id,
      }),
    });

    if (res.status === 401) {
      router.replace('/login');
      return;
    }

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || 'Something went wrong');
      return;
    }

    router.push('/dev/projects');
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] dark:bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8">
          <Head>
            <title>Create New Project – Garage Vision</title>
          </Head>

          <Card>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Create New Project
            </h1>

            {error && (
              <p className="text-red-500 mb-4">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="input w-full h-24 resize-none"
                />
              </div>
              <button
                type="submit"
                className="button w-36"
              >
                Create Project
              </button>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}
