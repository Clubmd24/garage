import React, { useEffect, useState } from 'react';
import OfficeLayout from '../../../components/OfficeLayout';

export default function PartCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState(null);

  const load = () => {
    fetch('/api/categories')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setCategories)
      .catch(() => setError('Failed to load categories'));
  };

  useEffect(load, []);

  const create = async e => {
    e.preventDefault();
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      setName('');
      load();
    } catch {
      setError('Failed to create category');
    }
  };

  const remove = async id => {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    load();
  };

  const startEdit = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const update = async id => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      if (!res.ok) throw new Error();
      cancelEdit();
      load();
    } catch {
      setError('Failed to update category');
    }
  };

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Part Categories</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={create} className="mb-4 flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} className="input flex-grow" placeholder="New category" />
        <button className="button" type="submit">Add</button>
      </form>
      <ul className="space-y-2">
        {categories.map(c => (
          <li key={c.id} className="flex justify-between items-center border p-2 rounded">
            {editingId === c.id ? (
              <>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="input flex-grow mr-2"
                />
                <div className="flex gap-2">
                  <button onClick={() => update(c.id)} className="button px-2 py-1 text-sm">
                    Save
                  </button>
                  <button onClick={cancelEdit} className="button-secondary px-2 py-1 text-sm">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>{c.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(c.id, c.name)} className="button px-2 py-1 text-sm">
                    Edit
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="button bg-red-600 hover:bg-red-700 px-2 py-1 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </OfficeLayout>
  );
}
