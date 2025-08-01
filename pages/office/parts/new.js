import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

export default function NewPartPage() {
  const [form, setForm] = useState({
    part_number: '',
    description: '',
    unit_cost: '',
    supplier_id: '',
    category_id: '',
  });
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { query } = router;

  useEffect(() => {
    Promise.all([
      fetch('/api/suppliers').then(r => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/categories').then(r => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([s, c]) => {
        setSuppliers(s);
        setCategories(c);
      })
      .catch(() => setError('Failed to load suppliers'));
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setForm(f => ({
      ...f,
      part_number: query.part_number || f.part_number,
      description: query.description || f.description,
      unit_cost: query.unit_cost || f.unit_cost,
      category_id: query.category_id || f.category_id,
    }));
  }, [router.isReady]);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part_number: form.part_number,
          description: form.description,
          unit_cost: form.unit_cost,
          supplier_id: form.supplier_id || null,
          category_id: form.category_id || null,
        }),
      });
      if (!res.ok) throw new Error();
      const dest = query.redirect || '/office/parts';
      router.push(dest);
    } catch {
      setError('Failed to create part');
    }
  };

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">New Part</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Part Number</label>
          <input name="part_number" value={form.part_number} onChange={change} className="input w-full" />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <input name="description" value={form.description} onChange={change} className="input w-full" />
        </div>
        <div>
          <label className="block mb-1">Unit Cost</label>
          <input name="unit_cost" value={form.unit_cost} onChange={change} className="input w-full" />
        </div>
        <div>
          <label className="block mb-1">Supplier</label>
          <select name="supplier_id" value={form.supplier_id} onChange={change} className="input w-full">
            <option value="">-- None --</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Category</label>
          <select name="category_id" value={form.category_id} onChange={change} className="input w-full">
            <option value="">-- None --</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="button">Save</button>
          <button
            type="button"
            onClick={() => router.back()}
            className="button-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </OfficeLayout>
  );
}
