import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../../components/Layout';
import { fetchClients } from '../../../lib/clients';
import { fetchFleets } from '../../../lib/fleets';
import { fetchVehicles } from '../../../lib/vehicles';
import { createQuote } from '../../../lib/quotes';

const emptyItem = { description: '', qty: 1, price: 0 };

export default function NewQuotationPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [mode, setMode] = useState('client');
  const [form, setForm] = useState({ customer_id: '', fleet_id: '', vehicle_id: '' });
  const [items, setItems] = useState([emptyItem]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm(f => ({ ...f, customer_id: '', fleet_id: '', vehicle_id: '' }));
    setVehicles([]);
  }, [mode]);

  useEffect(() => {
    fetchClients()
      .then(setClients)
      .catch(() => setError('Failed to load clients'));
  }, []);

  useEffect(() => {
    fetchFleets()
      .then(setFleets)
      .catch(() => setError('Failed to load fleets'));
  }, []);

  useEffect(() => {
    if (mode === 'client') {
      if (!form.customer_id) return setVehicles([]);
      fetchVehicles(form.customer_id, null)
        .then(setVehicles)
        .catch(() => setVehicles([]));
    } else {
      if (!form.fleet_id) return setVehicles([]);
      fetchVehicles(null, form.fleet_id)
        .then(setVehicles)
        .catch(() => setVehicles([]));
    }
  }, [mode, form.customer_id, form.fleet_id]);

  const addItem = () => setItems(items => [...items, emptyItem]);

  const changeItem = (i, field, value) => {
    setItems(itms => {
      const copy = [...itms];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  };

  const total = items.reduce(
    (sum, it) => sum + Number(it.qty) * Number(it.price),
    0
  );

  const submit = async e => {
    e.preventDefault();
    try {
      await createQuote({
        customer_id: mode === 'client' ? form.customer_id : null,
        fleet_id: mode === 'fleet' ? form.fleet_id : null,
        job_id: null,
        total_amount: total,
        status: 'new',
      });
      router.push('/office/quotations');
    } catch {
      setError('Failed to create quote');
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">New Quote</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 mb-8 max-w-lg">
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            className={(mode === 'client' ? 'button' : 'button-secondary') + ' px-4'}
            onClick={() => setMode('client')}
          >
            Client
          </button>
          <button
            type="button"
            className={(mode === 'fleet' ? 'button' : 'button-secondary') + ' px-4'}
            onClick={() => setMode('fleet')}
          >
            Fleet
          </button>
        </div>
        {mode === 'client' ? (
          <div>
            <label className="block mb-1">Client</label>
            <select
              className="input w-full"
              value={form.customer_id}
              onChange={e =>
                setForm(f => ({ ...f, customer_id: e.target.value, fleet_id: '' }))
              }
            >
              <option value="">Select client</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {(c.first_name || '') + ' ' + (c.last_name || '')}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block mb-1">Fleet</label>
            <select
              className="input w-full"
              value={form.fleet_id}
              onChange={e =>
                setForm(f => ({ ...f, fleet_id: e.target.value, customer_id: '' }))
              }
            >
              <option value="">Select fleet</option>
              {fleets.map(f => (
                <option key={f.id} value={f.id}>
                  {f.company_name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block mb-1">Vehicle</label>
          <select
            className="input w-full"
            value={form.vehicle_id}
            onChange={e =>
              setForm(f => ({ ...f, vehicle_id: e.target.value }))
            }
          >
            <option value="">Select vehicle</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.licence_plate}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Items</h2>
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-2">
              <input
                className="input col-span-2"
                placeholder="Description"
                value={it.description}
                onChange={e => changeItem(i, 'description', e.target.value)}
              />
              <input
                type="number"
                className="input"
                placeholder="Qty"
                value={it.qty}
                onChange={e => changeItem(i, 'qty', e.target.value)}
              />
              <input
                type="number"
                className="input"
                placeholder="Price"
                value={it.price}
                onChange={e => changeItem(i, 'price', e.target.value)}
              />
            </div>
          ))}
          <button type="button" onClick={addItem} className="button-secondary px-4">
            Add Item
          </button>
        </div>
        <p className="font-semibold">Total: €{total.toFixed(2)}</p>
        <button type="submit" className="button">
          Create Quote
        </button>
      </form>
    </Layout>
  );
}
