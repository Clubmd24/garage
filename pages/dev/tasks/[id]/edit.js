import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Sidebar } from '../../../../components/Sidebar';
import { Header } from '../../../../components/Header';
import { Card } from '../../../../components/Card';

export default function EditTask() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    assigned_to: '',
    due_date: ''
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        const r = await fetch('/api/users', { credentials: 'include' });
        if (!r.ok) throw new Error(`Users fetch failed (${r.status})`);
        const data = await r.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Unable to load users');
      }
    }
    loadUsers();
  }, []);

  useEffect(() => {
    if (!id) return;
    async function loadTask() {
      try {
        const r = await fetch(`/api/dev/tasks/${id}`, { credentials: 'include' });
        if (!r.ok) throw new Error(`Task fetch failed (${r.status})`);
        const data = await r.json();
        setForm({
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'todo',
          assigned_to: data.assigned_to || '',
          due_date: data.due_date ? data.due_date.slice(0, 10) : ''
        });
      } catch (err) {
        setError(err.message);
      }
    }
    loadTask();
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch(`/api/dev/tasks/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        status: form.status,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null
      })
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || `Server returned ${res.status}`);
      setLoading(false);
      return;
    }

    router.push(`/dev/tasks/${id}`);
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8">
          <Head><title>Edit Task</title></Head>

          <h1 className="text-3xl font-bold mb-6">Edit Task</h1>
          <Card>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="block mb-1">Title *</label>
                <input
                  type="text"
                  className="input"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
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

              <div>
                <label className="block mb-1">Status</label>
                <select
                  className="input"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Assign To</label>
                <select
                  className="input"
                  value={form.assigned_to}
                  onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                >
                  <option value="">— Unassigned —</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Due Date</label>
                <input
                  type="date"
                  className="input"
                  value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })}
                />
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <div className="flex space-x-4">
                <button type="submit" className="button" disabled={loading}>
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
                <Link href={`/dev/tasks/${id}`} className="button-secondary">
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
