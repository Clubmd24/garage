// Updated File: pages/admin/users.js
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

  useEffect(() => { loadUsers(); }, []);

  const handleAdd = async e => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ username: '', email: '', password: '', role: 'developer' });
    await loadUsers();
    setLoading(false);
  };

  const handleDelete = async id => {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    loadUsers();
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
                  onChange={e => setForm({...form, username: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="input"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Password"
                  className="input"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                />
                <select
                  className="input"
                  value={form.role}
                  onChange={e => setForm({...form, role: e.target.value})}
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
                {users.map(u => (
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


// API: Create User - pages/api/admin/users/index.js
import pool from '../../../../lib/db';
import { hashPassword } from '../../../../lib/auth';
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [users] = await pool.query(
      'SELECT u.id, u.username, u.email, r.name AS role FROM users u JOIN user_roles ur ON u.id=ur.user_id JOIN roles r ON ur.role_id=r.id'
    );
    return res.status(200).json(users);
  }
  if (req.method === 'POST') {
    const { username, email, password, role } = req.body;
    const pwHash = await hashPassword(password);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, pwHash]
      );
      const userId = result.insertId;
      const [[r]] = await conn.query('SELECT id FROM roles WHERE name=?', [role]);
      await conn.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, r.id]);
      await conn.commit();
      res.status(201).json({ id: userId });
    } catch (error) {
      await conn.rollback();
      res.status(500).json({ error: 'Failed to create user' });
    } finally {
      conn.release();
    }
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end('Method Not Allowed');
}


// API: Delete User - pages/api/admin/users/[id].js
import pool from '../../../../../lib/db';
export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM user_roles WHERE user_id=?', [id]);
    await pool.query('DELETE FROM users WHERE id=?', [id]);
    return res.status(200).json({ ok: true });
  }
  res.setHeader('Allow', ['DELETE']);
  res.status(405).end('Method Not Allowed');
}
