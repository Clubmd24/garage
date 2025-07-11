import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchFleets } from '../../../lib/fleets';
import { fetchVehicles, fetchVehicle } from '../../../lib/vehicles';
import { fetchClient } from '../../../lib/clients';
import { createQuote } from '../../../lib/quotes';

const emptyItem = {
  part_number: '',
  part_id: '',
  description: '',
  qty: 1,
  unit_cost: 0,
  markup: 0,
  price: 0,
};
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
    job_id: '',
    customer_ref: '',
    po_number: '',
    defect_description: '',
  });
  const [items, setItems] = useState([emptyItem]);
  const [error, setError] = useState(null);
  const [vehicleError, setVehicleError] = useState(null);
  const SAVE_KEY = 'quote_draft';

  // load draft from localStorage
  useEffect(() => {
    if (!router.isReady) return;
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.mode) setMode(data.mode);
        if (data.clientName) setClientName(data.clientName);
        if (data.form) setForm(f => ({ ...f, ...data.form }));
        if (data.items && data.items.length) setItems(data.items);
      } catch {
        /* ignore parse errors */
      }
    }
  }, [router.isReady]);

  useEffect(() => {
    setForm(f => ({ ...f, customer_id: '', fleet_id: '', vehicle_id: '' }));
    setClientName('');
    setVehicles([]);
  }, [mode]);


  useEffect(() => {
    if (!router.isReady) return;
    const { client_id, vehicle_id, job_id } = router.query;
    async function load() {
      if (client_id) {
        try {
          const c = await fetchClient(client_id);
          setClientName(`${c.first_name || ''} ${c.last_name || ''}`.trim());
          setForm(f => ({ ...f, customer_id: c.id }));
        } catch {
          setError(e => e || 'Failed to load client');
        }
      }
      if (job_id) {
        setForm(f => ({ ...f, job_id }));
      }
      if (vehicle_id) {
        try {
          const v = await fetchVehicle(vehicle_id);
          setForm(f => ({ ...f, vehicle_id: v.id }));
          if (v.customer_id) {
            setMode('client');
            setForm(f => ({ ...f, customer_id: v.customer_id }));
            try {
              const c = await fetchClient(v.customer_id);
              setClientName(`${c.first_name || ''} ${c.last_name || ''}`.trim());
            } catch {
              setError(e => e || 'Failed to load client');
            }
          } else if (v.fleet_id) {
            setMode('fleet');
            setForm(f => ({ ...f, fleet_id: v.fleet_id }));
          }
        } catch {
          setError(e => e || 'Failed to load vehicle');
        }
      }
    }
    load();
  }, [router.isReady]);


  useEffect(() => {
    fetchFleets()
      .then(setFleets)
      .catch(() => setError('Failed to load fleets'));
  }, []);

  useEffect(() => {
    if (mode === 'client') {
      if (!form.customer_id) {
        setVehicles([]);
        setVehicleError(null);
        return;
      }
      fetchVehicles(form.customer_id, null)
        .then(vs => {
          setVehicleError(null);
          setVehicles(vs);
        })
        .catch(() => {
          setVehicles([]);
          setVehicleError('Failed to load vehicles');
          setError(e => e || 'Failed to load vehicles');
        });
    } else {
      if (!form.fleet_id) {
        setVehicles([]);
        setVehicleError(null);
        return;
      }
      fetchVehicles(null, form.fleet_id)
        .then(vs => {
          setVehicleError(null);
          setVehicles(vs);
        })
        .catch(() => {
          setVehicles([]);
          setVehicleError('Failed to load vehicles');
          setError(e => e || 'Failed to load vehicles');
        });
    }
  }, [mode, form.customer_id, form.fleet_id, router.isReady]);

  const addItem = () => setItems(items => [...items, emptyItem]);

  const changeItem = (i, field, value) => {
    setItems(itms => {
      const copy = [...itms];
      const it = { ...copy[i], [field]: value };
      if (field === 'unit_cost' || field === 'markup') {
        const cost = Number(field === 'unit_cost' ? value : it.unit_cost);
        const markup = Number(field === 'markup' ? value : it.markup);
        it.price = cost * (1 + markup / 100);
      }
      copy[i] = it;
      return copy;
    });
  };

  const totalCost = items.reduce(
    (sum, it) => sum + Number(it.qty) * Number(it.unit_cost),
    0
  );
  const total = items.reduce(
    (sum, it) => sum + Number(it.qty) * Number(it.price),
    0
  );
  const markupPercent = totalCost ? ((total - totalCost) / totalCost) * 100 : 0;
  const profit = total - totalCost;

  const formatEuro = n =>
    new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(
      n || 0
    );

  // persist draft to localStorage
  useEffect(() => {
    const data = {
      mode,
      clientName,
      form,
      items,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }, [mode, clientName, form, items]);

  const submit = async e => {
    e.preventDefault();
    try {
      const quote = await createQuote({
        customer_id: mode === 'client' ? form.customer_id : null,
        fleet_id: mode === 'fleet' ? form.fleet_id : null,
        job_id: form.job_id || null,
        vehicle_id: form.vehicle_id || null,
        customer_reference: form.customer_ref || null,
        po_number: form.po_number || null,
        defect_description: form.defect_description || null,
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
            unit_cost: it.unit_cost,
            markup_percent: it.markup,
            unit_price: it.price,
          }),
        });
      }
      localStorage.removeItem(SAVE_KEY);
      router.push('/office/quotations');
    } catch {
      setError('Failed to create quote');
    }
  };

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">New Quote</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 mb-8 max-w-4xl">
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
          {vehicleError && (
            <p className="text-red-500 mt-1" data-testid="vehicle-error">
              {vehicleError}
            </p>
          )}
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
          <label className="block mb-1">Defect Description</label>
          <textarea
            className="input w-full"
            value={form.defect_description}
            onChange={e =>
              setForm(f => ({ ...f, defect_description: e.target.value }))
            }
          />
        </div>
        <div>
          <h2 className="font-semibold mb-2">Item Details</h2>
          <div className="grid grid-cols-10 gap-2 mb-2 font-semibold text-sm">
            <div>Part #</div>
            <div className="col-span-4">Description</div>
            <div>Qty</div>
            <div>Unit Cost</div>
            <div>Markup %</div>
            <div>Unit Price</div>
            <div>Line Price</div>
          </div>
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-10 gap-2 mb-2">
              <PartAutocomplete
                value={it.part_number}
                description={it.description}
                unit_cost={it.unit_cost}
                onChange={v => changeItem(i, 'part_number', v)}
                onSelect={p => {
                  changeItem(i, 'part_number', p.part_number);
                  changeItem(i, 'part_id', p.id);
                  changeItem(i, 'description', p.description || '');
                  changeItem(i, 'unit_cost', p.unit_cost || 0);
                }}
              />
              <input
                className="input w-full col-span-4"
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
                value={it.unit_cost}
                onChange={e => changeItem(i, 'unit_cost', e.target.value)}
              />
              <input
                type="number"
                className="input"
                placeholder="Markup %"
                value={it.markup}
                onChange={e => changeItem(i, 'markup', e.target.value)}
              />
              <div className="flex items-center px-2 border rounded bg-gray-50 justify-end">
                {formatEuro(it.price)}
              </div>
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
          <p className="font-semibold">Total Cost: {formatEuro(totalCost)}</p>
          <p className="font-semibold">Total Price: {formatEuro(total)}</p>
          <p className="font-semibold">
            Global Markup: {markupPercent.toFixed(2)}%
          </p>
          <p className="font-semibold">Expected Profit: {formatEuro(profit)}</p>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="button">Create Quote</button>
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
