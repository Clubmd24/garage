import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'developer'
  });

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);

  const updateRole = async (id, role) => {
    await fetch(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    setUsers(users.map(u => u.id === id ? { ...u, role } : u));
  };

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    setUsers(users.filter(u => u.id !== id));
  };

  const createUser = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      const created = await res.json();
      setUsers([...users, created]);
      setShowForm(false);
      setNewUser({ username: '', email: '', password: '', role: 'developer' });
    } else {
      const error = await res.json();
      alert('Error creating user: ' + error.message);
    }
  };

  return (
    <>
      <Head><title>Admin – User Management</title></Head>
      <div className="p-6">
        <h2 className="text-2xl mb-4">User Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="button mb-4">
          {showForm ? 'Cancel' : 'Add User'}
        </button>

        {showForm && (
          <form onSubmit={createUser} className="mb-4 space-y-2 p-4 bg-[var(--color-surface)] rounded-2xl shadow-lg">
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={e => setNewUser({ ...newUser, username: e.target.value })}
              className="input w-full"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              className="input w-full"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              className="input w-full"
              required
            />
            <select
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value })}
              className="input w-full"
            >
              <option value="admin">admin</option>
              <option value="developer">developer</option>
              <option value="readonly">readonly</option>
            </select>
            <button type="submit" className="button w-full">Create User</button>
          </form>
        )}

        <table className="w-full bg-[var(--color-surface)] rounded-2xl shadow-lg">
          <thead>
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="input">
                    <option>admin</option>
                    <option>developer</option>
                    <option>readonly</option>
                  </select>
                </td>
                <td className="p-2">
                  <button onClick={() => deleteUser(u.id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
