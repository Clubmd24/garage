import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Sidebar } from '../../../../components/Sidebar';
import { Header } from '../../../../components/Header';
import { Card } from '../../../../components/Card';

export default function EditProject() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // load existing project data
  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const r = await fetch(`/api/dev/projects/${id}`, { credentials: 'include' });
        if (!r.ok) throw new Error(`Project fetch failed (${r.status})`);
        const data = await r.json();
        setForm({ name: data.name || '', description: data.description || '' });
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch(`/api/dev/projects/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description || null,
      }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || `Server returned ${res.status}`);
      setLoading(false);
      return;
    }

    router.push(`/dev/projects/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        <main className="p-8">
          <Head><title>Edit Project</title></Head>

          <h1 className="text-3xl font-bold mb-6">Edit Project</h1>
          <Card>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="block mb-1">Name *</label>
                <input
                  type="text"
                  className="input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  className="input"
                  rows={4}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <div className="flex space-x-4">
                <button type="submit" className="button" disabled={loading}>
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
                <Link href={`/dev/projects/${id}`} className="button-secondary">
                  Cancel
                </Link>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}
