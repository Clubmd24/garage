import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../../components/OfficeLayout';
import { fetchFleets } from '../../../../lib/fleets';
import { fetchVehicles } from '../../../../lib/vehicles';
import { updateQuote } from '../../../../lib/quotes';

const emptyItem = {
  id: null,
  part_number: '',
  part_id: '',
  description: '',
  qty: 1,
  unit_cost: 0,
  markup: 0,
  price: 0,
};
import PartAutocomplete from '../../../../components/PartAutocomplete';
import ClientAutocomplete from '../../../../components/ClientAutocomplete';

export default function EditQuotationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
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
    defect_description: '',
  });
  const [items, setItems] = useState([emptyItem]);
  const [error, setError] = useState(null);

useEffect(() => {
  if (loading) return;
  setForm(f => ({ ...f, customer_id: '', fleet_id: '', vehicle_id: '' }));
  setClientName('');
  setVehicles([]);
}, [mode]);

  useEffect(() => {
    fetchFleets()
      .then(setFleets)
      .catch(() => setError(e => e || 'Failed to load fleets'));
  }, []);

  useEffect(() => {
    if (mode === 'client') {
      if (!form.customer_id) return setVehicles([]);
      fetchVehicles(form.customer_id, null)
        .then(setVehicles)
        .catch(() => {
          setVehicles([]);
          setError(e => e || 'Failed to load vehicles');
        });
    } else {
      if (!form.fleet_id) return setVehicles([]);
      fetchVehicles(null, form.fleet_id)
        .then(setVehicles)
        .catch(() => {
          setVehicles([]);
          setError(e => e || 'Failed to load vehicles');
        });
    }
  }, [mode, form.customer_id, form.fleet_id]);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      setError(null);

      let quote = null;
      let its = [];

      try {
        const res = await fetch(`/api/quotes/${id}`);
        if (res.ok) quote = await res.json();
        else throw new Error('quote');
      } catch {
        setError(e => e || 'Failed to load quote');
      }

      try {
        const res = await fetch(`/api/quote-items?quote_id=${id}`);
        if (res.ok) its = await res.json();
        else throw new Error('items');
      } catch {
        setError(e => e || 'Failed to load quote items');
      }

      if (quote) {
        setMode(quote.fleet_id ? 'fleet' : 'client');
        setForm({
          customer_id: quote.customer_id || '',
          fleet_id: quote.fleet_id || '',
          vehicle_id: quote.vehicle_id || '',
          customer_ref: quote.customer_reference || '',
          po_number: quote.po_number || '',
          defect_description: quote.defect_description || '',
        });
        if (quote.customer_id) {
          try {
            const cRes = await fetch(`/api/clients/${quote.customer_id}`);
            if (cRes.ok) {
              const c = await cRes.json();
              setClientName(`${c.first_name || ''} ${c.last_name || ''}`.trim());
            } else {
              throw new Error('client');
            }
          } catch {
            setError(e => e || 'Failed to load client');
          }
        }
      }

      const detailed = await Promise.all(
        its.map(async it => {
          let part_number = '';
          if (it.part_id) {
            try {
              const pRes = await fetch(`/api/parts/${it.part_id}`);
              if (pRes.ok) {
                const p = await pRes.json();
                part_number = p.part_number || '';
              }
            } catch {
              /* ignore part load error */
            }
          }
          return {
            id: it.id,
            part_id: it.part_id || '',
            part_number,
            description: it.description || '',
            qty: it.qty || 1,
            unit_cost: it.unit_cost || 0,
            markup: it.markup_percent || 0,
            price: it.unit_price || 0,
          };
        })
      );
      setItems(detailed.length ? detailed : [emptyItem]);

      setLoading(false);
    }
    load();
  }, [id]);

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

  const submit = async e => {
    e.preventDefault();
    try {
      await updateQuote(id, {
        customer_id: mode === 'client' ? form.customer_id : null,
        fleet_id: mode === 'fleet' ? form.fleet_id : null,
        job_id: null,
        vehicle_id: form.vehicle_id || null,
        customer_reference: form.customer_ref || null,
        po_number: form.po_number || null,
        defect_description: form.defect_description || null,
        total_amount: total,
        status: 'new',
      });
      for (const it of items) {
        if (it.id) {
          await fetch(`/api/quote-items/${it.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              description: it.description,
              qty: it.qty,
              unit_cost: it.unit_cost,
              markup_percent: it.markup,
              unit_price: it.price,
            }),
          });
        } else {
          await fetch('/api/quote-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quote_id: id,
              part_id: it.part_id || null,
              description: it.description,
              qty: it.qty,
              unit_cost: it.unit_cost,
              markup_percent: it.markup,
              unit_price: it.price,
            }),
          });
        }
      }
      router.push('/office/quotations');
    } catch {
      setError('Failed to update quote');
    }
  };

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Edit Quote</h1>
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
        <button type="submit" className="button">
          Update Quote
        </button>
      </form>
    </OfficeLayout>
  );
}

