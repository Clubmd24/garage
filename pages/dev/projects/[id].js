// File: pages/dev/tasks/[id].js

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';

export default function TaskDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [task, setTask] = useState(null);
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

  // Load the task
  useEffect(() => {
    if (!id) return;
    fetch(`/api/dev/tasks/${id}`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error(`Fetch failed (${r.status})`);
        return r.json();
      })
      .then(data => {
        setTask(data);
        setForm({
          title: data.title,
          description: data.description || '',
          status: data.status,
          assigned_to: data.assigned_to || '',
          due_date: data.due_date ? data.due_date.slice(0,10) : ''
        });
      })
      .catch(e => setError(e.message));
  }, [id]);

  // Load users for assignment
  useEffect(() => {
    fetch('/api/admin/users', { credentials: 'include' })
      .then(r => r.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
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
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || `Error ${res.status}`);
      return;
    }
    // on success, back to project detail
    router.push(`/dev/projects/${task.project_id}`);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/dev/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    router.push(`/dev/projects/${task.project_id}`);
  };

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;
  if (!task) return <p className="p-8">Loading task…</p>;

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8">
          <Head><title>Task – {task.title}</title></Head>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <div className="space-x-2">
              <button onClick={handleDelete} className="button-secondary">Delete</button>
              <Link href={`/dev/projects/${task.project_id}`}>
                <a className="button-secondary">Back to Project</a>
              </Link>
            </div>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="block mb-1">Title *</label>
                <input
                  type="text"
                  className="input w-full"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  rows={4}
                  className="input w-full"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1">Status</label>
                <select
                  className="input w-full"
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
                  className="input w-full"
                  value={form.assigned_to}
                  onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                >
                  <option value="">— Unassigned —</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Due Date</label>
                <input
                  type="date"
                  className="input w-full"
                  value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })}
                />
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <button type="submit" className="button" disabled={loading}>
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}
