// File: pages/admin/users.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'developer' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError('Access denied');
          return;
        }
        throw new Error(`Auth error: ${res.status}`);
      }

      const usersRes = await fetch('/api/admin/users', { credentials: 'include' });
      if (!usersRes.ok) {
        if (usersRes.status === 401 || usersRes.status === 403) {
          setError('Access denied');
          return;
        }
        throw new Error(`Failed to load users: ${usersRes.status}`);
      }

      const data = await usersRes.json();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err.message);
      router.replace('/login');
    }
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

const handleAdd = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error('Failed to add user');
    await loadUsers();
  } catch (err) {
    setError(err?.message || 'Failed to add user');
  } finally {
    setForm({ username: '', email: '', password: '', role: 'developer' });
    setLoading(false);
  }
};

const handleDelete = async (id) => {
  if (!confirm('Delete this user?')) return;
  try {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete user');
    await loadUsers();
  } catch (err) {
    setError(err?.message || 'Failed to delete user');
  }
};

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        <main className="p-8 space-y-8">
          <Head>
            <title>Admin - User Management</title>
          </Head>

          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            User Management
          </h1>
          {error && (
            <p className="text-red-600 font-semibold" data-testid="error-message">
              {error}
            </p>
          )}

          <Card>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Add New User
            </h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Username"
                className="input bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="input bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="input bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <select
                className="input bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="admin">admin</option>
                <option value="developer">developer</option>
                <option value="readonly">readonly</option>
              </select>
              <button type="submit" className="button col-span-full self-end" disabled={loading}>
                {loading ? 'Adding...' : 'Add User'}
              </button>
            </form>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-[var(--color-surface)] dark:bg-[var(--color-surface)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-white">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-white">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-white">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--color-surface)] dark:bg-[var(--color-surface)] divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                        {u.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-3 py-1 rounded-full bg-[var(--color-primary-light)] text-white text-xs">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
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
          </Card>
        </main>
      </div>
    </div>
  );
}
