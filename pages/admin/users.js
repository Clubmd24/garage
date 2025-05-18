import { useState, useEffect } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch('/api/admin/users').then(res => res.json()).then(setUsers);
  }, []);
  const updateRole = async (id, role) => {
    await fetch(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ role })
    });
    setUsers(users.map(u => u.id===id?{...u,role}:u));
  };
  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">User Management</h2>
      <table className="w-full bg-[var(--color-surface)] rounded-2xl shadow-lg">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>
          {users.map(u=>(
            <tr key={u.id}>
              <td>{u.username}</td><td>{u.email}</td>
              <td>
                <select value={u.role} onChange={e=>updateRole(u.id,e.target.value)}>
                  <option>admin</option><option>developer</option><option>readonly</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}