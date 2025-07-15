import React, { useEffect, useState } from 'react';
import OfficeLayout from '../../../components/OfficeLayout';
import Link from 'next/link';

export default function UsersPage() {
  const emptyForm = { username: '', email: '', password: '', role: 'developer' };
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/users').then(r => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/user-roles').then(r => (r.ok ? r.json() : [])),
    ])
      .then(([u, r]) => {
        setUsers(u);
        setRoles(r);
      })
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const startEdit = user => {
    setEditingId(user.id);
    setForm({ username: user.username, email: user.email, password: '', role: user.role });
  };

  const cancel = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async e => {
    e.preventDefault();
    const url = editingId ? `/api/admin/users/${editingId}` : '/api/admin/users';
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      cancel();
      load();
    } else {
      setError('Failed to save user');
    }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <OfficeLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Link href="/office/company-settings" className="button">
          Back to Settings
        </Link>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          {users.map(u => (
            <div key={u.id} className="item-card text-black dark:text-white">
              <h2 className="font-semibold mb-1">{u.username}</h2>
              <p className="text-sm mb-1">{u.email}</p>
              <p className="text-sm mb-2">{u.role}</p>
              <div className="flex gap-2">
                <button onClick={() => startEdit(u)} className="button px-4 text-sm">Edit</button>
                <button onClick={() => handleDelete(u.id)} className="button px-4 text-sm bg-red-600 hover:bg-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2">{editingId ? 'Edit User' : 'New User'}</h2>
      <form onSubmit={submit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Username</label>
          <input name="username" value={form.username} onChange={change} className="input w-full" required />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={change} className="input w-full" required />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input type="password" name="password" value={form.password} onChange={change} className="input w-full" required={!editingId} />
        </div>
        <div>
          <label className="block mb-1">Role</label>
          <select name="role" value={form.role} onChange={change} className="input w-full">
            {roles.map(r => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="button">
            {editingId ? 'Update User' : 'Create User'}
          </button>
          {editingId && (
            <button type="button" onClick={cancel} className="button-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </OfficeLayout>
  );
}
