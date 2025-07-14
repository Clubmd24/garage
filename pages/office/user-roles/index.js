import React, { useEffect, useState } from 'react';
import OfficeLayout from '../../../components/OfficeLayout';
import Link from 'next/link';

export default function UserRolesPage() {
  const emptyForm = { name: '', description: '', developer: false, office: false, engineer: false, apprentice: false };
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    fetch('/api/user-roles')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setRoles)
      .catch(() => setError('Failed to load roles'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const change = e => {
    const { name, type, checked, value } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEdit = role => {
    setEditingId(role.id);
    setForm({
      name: role.name || '',
      description: role.description || '',
      developer: !!role.developer,
      office: !!role.office,
      engineer: !!role.engineer,
      apprentice: !!role.apprentice,
    });
  };

  const cancel = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async e => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(
        editingId ? `/api/user-roles/${editingId}` : '/api/user-roles',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error();
      cancel();
      load();
    } catch {
      setError('Failed to save role');
    }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this role?')) return;
    await fetch(`/api/user-roles/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <OfficeLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">User Roles</h1>
        <Link href="/office/company-settings" className="button">
          Back to Settings
        </Link>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          {roles.map(r => (
            <div key={r.id} className="item-card text-black dark:text-white">
              <h2 className="font-semibold mb-1">{r.name}</h2>
              <p className="text-sm mb-2">{r.description || '—'}</p>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={!!r.developer} readOnly /> developer
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={!!r.office} readOnly /> office
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={!!r.engineer} readOnly /> engineer
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={!!r.apprentice} readOnly /> apprentice
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(r)} className="button px-4 text-sm">Edit</button>
                <button onClick={() => handleDelete(r.id)} className="button px-4 text-sm bg-red-600 hover:bg-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2">{editingId ? 'Edit Role' : 'New Role'}</h2>
      <form onSubmit={submit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Name</label>
          <input name="name" value={form.name} onChange={change} className="input w-full" required />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={change} className="input w-full" rows={2} />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-1">
            <input type="checkbox" name="developer" checked={form.developer} onChange={change} /> developer
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" name="office" checked={form.office} onChange={change} /> office
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" name="engineer" checked={form.engineer} onChange={change} /> engineer
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" name="apprentice" checked={form.apprentice} onChange={change} /> apprentice
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="button">
            {editingId ? 'Update Role' : 'Create Role'}
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
