// File: pages/admin/users.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'developer' });
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ username: '', email: '', password: '', role: 'developer' });
      await loadUsers();
    } else {
      console.error('Failed to add user');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) loadUsers();
    else console.error('Failed to delete user');
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] dark:bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">
          <Head><title>Admin - User Management</title></Head>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">User Management</h2>

          {/* Add User Form */}
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Add New User</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  className="input"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Password"
                  className="input"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <select
                  className="input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="admin">admin</option>
                  <option value="developer">developer</option>
                  <option value="readonly">readonly</option>
                </select>
              </div>
              <button type="submit" className="button" disabled={loading}>
                {loading ? 'Adding...' : 'Add User'}
              </button>
            </form>
          </div>

          {/* Users Table */}
          <div className="card">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-2">Username</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-2 text-[var(--color-text-primary)]">{u.username}</td>
                    <td className="p-2 text-[var(--color-text-primary)]">{u.email}</td>
                    <td className="p-2">
                      <span className="px-2 py-1 rounded-full bg-[var(--color-primary-light)] text-white text-sm">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
