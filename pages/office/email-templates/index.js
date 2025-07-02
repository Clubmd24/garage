import React, { useEffect, useState } from 'react';
import OfficeLayout from '../../../components/OfficeLayout';

export default function EmailTemplatesPage() {
  const emptyForm = { name: '', subject: '', body: '', type: '' };
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    fetch('/api/company/email-templates')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setTemplates)
      .catch(() => setError('Failed to load templates'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const startEdit = tpl => {
    setEditingId(tpl.id);
    setForm({
      name: tpl.name || '',
      subject: tpl.subject || '',
      body: tpl.body || '',
      type: tpl.type || '',
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
        editingId
          ? `/api/company/email-templates/${editingId}`
          : '/api/company/email-templates',
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
      setError('Failed to save template');
    }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this template?')) return;
    await fetch(`/api/company/email-templates/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <OfficeLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Email Templates</h1>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          {templates.map(t => (
            <div key={t.id} className="item-card">
              <h2 className="font-semibold mb-1">{t.name}</h2>
              <p className="text-sm">Type: {t.type}</p>
              <p className="text-sm mb-2">Subject: {t.subject}</p>
              <div className="flex gap-2">
                <button onClick={() => startEdit(t)} className="button px-4 text-sm">Edit</button>
                <button onClick={() => handleDelete(t.id)} className="button px-4 text-sm bg-red-600 hover:bg-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2">{editingId ? 'Edit Template' : 'New Template'}</h2>
      <form onSubmit={submit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Name</label>
          <input name="name" value={form.name} onChange={change} className="input w-full" />
        </div>
        <div>
          <label className="block mb-1">Type</label>
          <input name="type" value={form.type} onChange={change} className="input w-full" />
        </div>
        <div>
          <label className="block mb-1">Subject</label>
          <input name="subject" value={form.subject} onChange={change} className="input w-full" />
        </div>
        <div>
          <label className="block mb-1">Body</label>
          <textarea name="body" value={form.body} onChange={change} className="input w-full h-32" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="button">{editingId ? 'Save' : 'Create'}</button>
          {editingId && (
            <button type="button" onClick={cancel} className="button bg-gray-600 hover:bg-gray-700">Cancel</button>
          )}
        </div>
      </form>
    </OfficeLayout>
  );
}

