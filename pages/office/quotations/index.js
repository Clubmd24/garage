import React, { useEffect, useState } from 'react';
import { Layout } from '../../../components/Layout';
import { fetchClients } from '../../../lib/clients';
import { fetchVehicles } from '../../../lib/vehicles';
import {
  fetchQuotes,
  createQuote,
  updateQuote,
} from '../../../lib/quotes';

const emptyItem = { description: '', qty: 1, price: 0 };

const QuotationsPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ customer_id: '', vehicle_id: '' });
  const [items, setItems] = useState([emptyItem]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([fetchQuotes(), fetchClients()])
      .then(([q, c]) => {
        setQuotes(q);
        setClients(c);
      })
      .catch(() => setError('Failed to load quotes'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    if (!form.customer_id) return setVehicles([]);
    fetchVehicles(form.customer_id)
      .then(setVehicles)
      .catch(() => setVehicles([]));
  }, [form.customer_id]);

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
        customer_id: form.customer_id,
        job_id: null,
        total_amount: total,
        status: 'new',
      });
      setForm({ customer_id: '', vehicle_id: '' });
      setItems([emptyItem]);
      load();
    } catch {
      setError('Failed to create quote');
    }
  };

  const approve = async id => {
    await updateQuote(id, { status: 'approved' });
    load();
  };

  const convert = async id => {
    await updateQuote(id, { status: 'job-card' });
    load();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Quotations</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 mb-8 max-w-lg">
        <div>
          <label className="block mb-1">Client</label>
          <select
            className="input w-full"
            value={form.customer_id}
            onChange={e =>
              setForm(f => ({ ...f, customer_id: e.target.value }))
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
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {quotes.map(q => (
            <div key={q.id} className="item-card">
              <h2 className="font-semibold mb-1">Quote #{q.id}</h2>
              <p className="text-sm">Client ID: {q.customer_id}</p>
              <p className="text-sm">Total: €{q.total_amount}</p>
              <p className="text-sm capitalize">Status: {q.status}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {q.status !== 'approved' && q.status !== 'job-card' && (
                  <button
                    onClick={() => approve(q.id)}
                    className="button px-4 text-sm"
                  >
                    Approve
                  </button>
                )}
                {q.status === 'approved' && (
                  <button
                    onClick={() => convert(q.id)}
                    className="button px-4 text-sm"
                  >
                    Create Job Card
                  </button>
                )}
                <a
                  href={`/api/quotes/${q.id}/pdf`}
                  className="button-secondary px-4 text-sm"
                >
                  Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default QuotationsPage;
