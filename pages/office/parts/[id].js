import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

export default function EditPartPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({
    part_number: '',
    description: '',
    unit_cost: '',
    supplier_id: '',
  });
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/parts/${id}`).then(r => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/suppliers').then(r => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([p, s]) => {
        setForm({
          part_number: p.part_number || '',
          description: p.description || '',
          unit_cost: p.unit_cost || '',
          supplier_id: p.supplier_id || '',
        });
        setSuppliers(s);
      })
      .catch(() => setError('Failed to load part'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    try {
      await fetch(`/api/parts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part_number: form.part_number,
          description: form.description,
          unit_cost: form.unit_cost,
          supplier_id: form.supplier_id || null,
        }),
      });
      router.push('/office/parts');
    } catch {
      setError('Failed to update part');
    }
  };

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Edit Part</h1>
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
