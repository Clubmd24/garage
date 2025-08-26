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
    unit_sale_price: '',
    markup_percentage: '',
    supplier_id: '',
    category_id: '',
  });
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/parts/${id}`).then(r => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/suppliers').then(r => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/categories').then(r => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([p, s, c]) => {
        setForm({
          part_number: p.part_number || '',
          description: p.description || '',
          unit_cost: p.unit_cost || '',
          unit_sale_price: p.unit_sale_price || '',
          markup_percentage: p.markup_percentage || '',
          supplier_id: p.supplier_id || '',
          category_id: p.category_id || '',
        });
        setSuppliers(s);
        setCategories(c);
      })
      .catch(() => setError('Failed to load part'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const change = e => {
    const { name, value } = e.target;
    setForm(f => {
      const newForm = { ...f, [name]: value };
      
      // Auto-calculate markup percentage when unit cost and unit sale price change
      if (name === 'unit_cost' || name === 'unit_sale_price') {
        const cost = parseFloat(newForm.unit_cost) || 0;
        const salePrice = parseFloat(newForm.unit_sale_price) || 0;
        
        if (cost > 0 && salePrice > 0) {
          const markup = ((salePrice - cost) / cost) * 100;
          newForm.markup_percentage = markup.toFixed(2);
        }
      }
      
      // Auto-calculate unit sale price when markup percentage changes
      if (name === 'markup_percentage') {
        const cost = parseFloat(newForm.unit_cost) || 0;
        const markup = parseFloat(value) || 0;
        
        if (cost > 0 && markup > 0) {
          const salePrice = cost * (1 + markup / 100);
          newForm.unit_sale_price = salePrice.toFixed(2);
        }
      }
      
      return newForm;
    });
  };

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
          unit_sale_price: form.unit_sale_price || null,
          markup_percentage: form.markup_percentage || null,
          supplier_id: form.supplier_id || null,
          category_id: form.category_id || null,
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
          <input 
            name="unit_cost" 
            type="number" 
            step="0.01" 
            value={form.unit_cost} 
            onChange={change} 
            className="input w-full" 
          />
        </div>
        <div>
          <label className="block mb-1">Unit Sale Price</label>
          <input 
            name="unit_sale_price" 
            type="number" 
            step="0.01" 
            value={form.unit_sale_price} 
            onChange={change} 
            className="input w-full" 
          />
        </div>
        <div>
          <label className="block mb-1">Markup %</label>
          <input 
            name="markup_percentage" 
            type="number" 
            step="0.01" 
            value={form.markup_percentage} 
            onChange={change} 
            className="input w-full" 
          />
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
