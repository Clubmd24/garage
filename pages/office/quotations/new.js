import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchFleets } from '../../../lib/fleets';
import { fetchVehicles } from '../../../lib/vehicles';
import { createQuote } from '../../../lib/quotes';

const emptyItem = { part_number: '', part_id: '', description: '', qty: 1, price: 0 };
import PartAutocomplete from '../../../components/PartAutocomplete';
import ClientAutocomplete from '../../../components/ClientAutocomplete';

export default function NewQuotationPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [mode, setMode] = useState('client');
  const [clientName, setClientName] = useState('');
  const [form, setForm] = useState({
    customer_id: '',
    fleet_id: '',
    vehicle_id: '',
    customer_ref: '',
    po_number: '',
  });
  const [items, setItems] = useState([emptyItem]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm(f => ({ ...f, customer_id: '', fleet_id: '', vehicle_id: '' }));
    setClientName('');
    setVehicles([]);
  }, [mode]);


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

  const formatEuro = n =>
    new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(
      n || 0
    );

  const submit = async e => {
    e.preventDefault();
    try {
      const quote = await createQuote({
        customer_id: mode === 'client' ? form.customer_id : null,
        fleet_id: mode === 'fleet' ? form.fleet_id : null,
        job_id: null,
        vehicle_id: form.vehicle_id || null,
        customer_reference: form.customer_ref || null,
        po_number: form.po_number || null,
        total_amount: total,
        status: 'new',
      });
      for (const it of items) {
        await fetch('/api/quote-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quote_id: quote.id,
            part_id: it.part_id || null,
            description: it.description,
            qty: it.qty,
            unit_price: it.price,
          }),
        });
      }
      router.push('/office/quotations');
    } catch {
      setError('Failed to create quote');
    }
  };

  return (
    <OfficeLayout>
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
            <ClientAutocomplete
              value={clientName}
              onChange={v => {
                setClientName(v);
                setForm(f => ({ ...f, customer_id: '' }));
              }}
              onSelect={c => {
                setClientName(`${c.first_name || ''} ${c.last_name || ''}`.trim());
                setForm(f => ({ ...f, customer_id: c.id, fleet_id: '' }));
              }}
            />
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
          <label className="block mb-1">Customer Ref #</label>
          <input
            className="input w-full"
            value={form.customer_ref}
            onChange={e =>
              setForm(f => ({ ...f, customer_ref: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block mb-1">PO Number</label>
          <input
            className="input w-full"
            value={form.po_number}
            onChange={e =>
              setForm(f => ({ ...f, po_number: e.target.value }))
            }
          />
        </div>
        <div>
          <h2 className="font-semibold mb-2">Item Details</h2>
          <div className="grid grid-cols-5 gap-2 mb-2 font-semibold text-sm">
            <div>Part #</div>
            <div>Description</div>
            <div>Qty</div>
            <div>Unit Cost</div>
            <div>Line Cost</div>
          </div>
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 mb-2">
              <PartAutocomplete
                value={it.part_number}
                onChange={v => changeItem(i, 'part_number', v)}
                onSelect={p => {
                  changeItem(i, 'part_number', p.part_number);
                  changeItem(i, 'part_id', p.id);
                  changeItem(i, 'description', p.description || '');
                  changeItem(i, 'price', p.unit_cost || 0);
                }}
              />
              <input
                className="input"
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
                placeholder="Unit cost"
                value={it.price}
                onChange={e => changeItem(i, 'price', e.target.value)}
              />
              <div className="flex items-center px-2 border rounded bg-gray-50">
                {formatEuro(Number(it.qty) * Number(it.price))}
              </div>
            </div>
          ))}
          <button type="button" onClick={addItem} className="button-secondary px-4">
            Add Item
          </button>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Summary</h2>
          <p className="font-semibold">Total: {formatEuro(total)}</p>
        </div>
        <button type="submit" className="button">
          Create Quote
        </button>
      </form>
    </OfficeLayout>
  );
}
