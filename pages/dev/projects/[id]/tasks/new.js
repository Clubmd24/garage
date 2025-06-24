// File: pages/dev/projects/[id]/tasks/new.js

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Sidebar } from '../../../../../components/Sidebar';
import { Header } from '../../../../../components/Header';
import { Card } from '../../../../../components/Card';

export default function NewTask() {
  const router = useRouter();
  const { id } = router.query;  // ← use `id`, not `project_id`

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

  // fetch users for “Assign To”
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

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/dev/tasks', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: id,               // ← use `id`
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

    // back to project detail on success
    router.push(`/dev/projects/${id}`);  // ← use `id`
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8">
          <Head><title>New Task</title></Head>

          <h1 className="text-3xl font-bold mb-6">
            Add Task to Project #{id}
          </h1>

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
                  onChange={e =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block mb-1">Status</label>
                <select
                  className="input"
                  value={form.status}
                  onChange={e =>
                    setForm({ ...form, status: e.target.value })
                  }
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
                  onChange={e =>
                    setForm({ ...form, assigned_to: e.target.value })
                  }
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
                  onChange={e =>
                    setForm({ ...form, due_date: e.target.value })
                  }
                />
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="button"
                  disabled={loading}
                >
                  {loading ? 'Creating…' : 'Create Task'}
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
