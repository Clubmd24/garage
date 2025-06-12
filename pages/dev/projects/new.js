import { useState } from 'react';
import { useRouter } from 'next/router';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/Card';

export default function NewProject() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/dev/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || `Server returned ${res.status}`);
      setLoading(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/dev/projects/${id}`);
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8">
          <h1 className="text-3xl font-bold mb-6">New Project</h1>
          <Card>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="block mb-1">Name *</label>
                <input
                  type="text"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  className="input"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <div className="flex space-x-4">
                <button type="submit" className="button" disabled={loading}>
                  {loading ? 'Creating…' : 'Create Project'}
                </button>
                <a href="/dev/projects" className="button-secondary">
                  Cancel
                </a>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}
