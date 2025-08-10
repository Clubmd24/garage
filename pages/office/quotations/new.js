import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchFleets } from '../../../lib/fleets';
import { fetchVehicle } from '../../../lib/vehicles';
import { fetchClient } from '../../../lib/clients';
import { createQuote } from '../../../lib/quotes';

const emptyItem = {
  part_number: '',
  part_id: '',
  description: '',
  qty: '',
  unit_cost: '',
  markup: '',
  price: '',
};
import PartAutocomplete from '../../../components/PartAutocomplete';
import DescriptionAutocomplete from '../../../components/DescriptionAutocomplete';
import ClientAutocomplete from '../../../components/ClientAutocomplete';
import VehicleAutocomplete from '../../../components/VehicleAutocomplete';
import FromAD360Button from '../../../components/quotes/FromAD360Button';
import AD360Autocomplete from '../../../components/quotes/AD360Autocomplete';

export default function NewQuotationPage() {
  const router = useRouter();
  const [fleets, setFleets] = useState([]);
  const [mode, setMode] = useState('client');
  const [clientName, setClientName] = useState('');
  const [selectedVehicleDisplay, setSelectedVehicleDisplay] = useState('');
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
  const [ad360Items, setAd360Items] = useState([]);
  const [ad360Mode, setAd360Mode] = useState(false);
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
        // Don't load items from draft for new quotes - start with empty item
        // if (data.items && data.items.length) setItems(data.items);
      } catch {
        /* ignore parse errors */
      }
    }
    // Always start with empty items for new quotes
    setItems([emptyItem]);
  }, [router.isReady]);

  useEffect(() => {
    setForm(f => ({ ...f, customer_id: '', fleet_id: '', vehicle_id: '' }));
    setClientName('');
    setSelectedVehicleDisplay('');
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
          setSelectedVehicleDisplay(`${v.licence_plate || 'No Plate'} - ${v.make} ${v.model} ${v.year}`);
          if (v.customer_id) {
            setMode('client');
            setForm(f => ({ ...f, customer_id: v.customer_id }));
            try {
              const c = await fetchClient(v.customer_id);
              setClientName(`${c.first_name || ''} ${c.last_name || ''}`.trim());
            } catch {
              setError(e => e || 'Failed to load client');
            }
          } else if (v.fleet_id && v.fleet_id !== 2) {
            // Treat fleet_id = 2 (LOCAL) as direct clients, not fleet vehicles
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

  // Vehicles are now loaded dynamically via VehicleAutocomplete
  // No need to pre-load all vehicles

  const addItem = () => setItems(items => [...items, emptyItem]);

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items => items.filter((_, i) => i !== index));
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(SAVE_KEY);
    setItems([emptyItem]);
    setForm({
      customer_id: '',
      fleet_id: '',
      vehicle_id: '',
      job_id: '',
      customer_ref: '',
      po_number: '',
      defect_description: '',
    });
    setClientName('');
    setSelectedVehicleDisplay('');
    setMode('client');
  };

  const changeItem = (i, field, value) => {
    setItems(itms => {
      const copy = [...itms];
      const it = { ...copy[i], [field]: value };
      if (field === 'unit_cost' || field === 'markup') {
        const cost = Number(field === 'unit_cost' ? value : it.unit_cost) || 0;
        const markup = Number(field === 'markup' ? value : it.markup) || 0;
        it.price = cost * (1 + markup / 100);
      }
      copy[i] = it;
      return copy;
    });
  };

  const totalCost = items.reduce(
    (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unit_cost) || 0),
    0
  );
  const total = items.reduce(
    (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0),
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
    
    // Basic validation
    if (!form.customer_id && !form.fleet_id) {
      setError('Please select either a client or fleet');
      return;
    }
    
    if (!form.vehicle_id) {
      setError('Please select a vehicle');
      return;
    }
    
    // Check if items have required fields
    const validItems = items.filter(item => 
      item.description && item.qty && item.unit_cost
    );
    
    if (validItems.length === 0) {
      setError('Please add at least one item with description, quantity, and unit cost');
      return;
    }
    
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
      for (const it of validItems) {
        await fetch('/api/quote-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quote_id: quote.id,
            part_id: it.part_id || null,
            description: it.description || '',
            qty: Number(it.qty) || 0,
            unit_cost: Number(it.unit_cost) || 0,
            markup_percent: Number(it.markup) || 0,
            unit_price: Number(it.price) || 0,
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
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Fields marked with * are required. You must add at least one item with description, quantity, and unit cost.
        </p>
      </div>
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
            <label className="block mb-1">Client *</label>
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
            <label className="block mb-1">Fleet *</label>
            <select
              className="input w-full"
              value={form.fleet_id}
              onChange={e =>
                setForm(f => ({ ...f, fleet_id: e.target.value, customer_id: '' }))
              }
            >
              <option value="">Select fleet</option>
              {fleets.filter(f => f.id !== 2).map(f => (
                <option key={f.id} value={f.id}>
                  {f.company_name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block mb-1">Vehicle *</label>
          {form.vehicle_id && selectedVehicleDisplay ? (
            <div className="flex items-center gap-2">
              <div className="input-readonly flex-1">{selectedVehicleDisplay}</div>
              <button
                type="button"
                onClick={() => {
                  setForm(f => ({ ...f, vehicle_id: '' }));
                  setSelectedVehicleDisplay('');
                }}
                className="button-secondary px-2"
              >
                Clear
              </button>
            </div>
          ) : (
            <VehicleAutocomplete
              value=""
              onChange={v => {
                // Allow typing for search - don't clear vehicle selection here
              }}
              onSelect={v => {
                setForm(f => ({ ...f, vehicle_id: v.id }));
                setSelectedVehicleDisplay(`${v.licence_plate || 'No Plate'} - ${v.make} ${v.model} ${v.year}`);
                // Auto-populate client if vehicle has one
                if (v.customer_id && !form.customer_id) {
                  setMode('client');
                  setForm(f => ({ ...f, customer_id: v.customer_id, fleet_id: '' }));
                  // Fetch and set client name
                  fetchClient(v.customer_id).then(c => {
                    setClientName(`${c.first_name || ''} ${c.last_name || ''}`.trim());
                  }).catch(() => {});
                } else if (v.fleet_id && !form.fleet_id && v.fleet_id !== 2) {
                  // Treat fleet_id = 2 (LOCAL) as direct clients, not fleet vehicles
                  setMode('fleet');
                  setForm(f => ({ ...f, fleet_id: v.fleet_id, customer_id: '' }));
                }
              }}
              customerId={mode === 'client' ? form.customer_id : null}
              fleetId={mode === 'fleet' ? form.fleet_id : null}
              placeholder="Search vehicles by license plate or description"
            />
          )}
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
          
          {/* AD360 Integration */}
          {form.vehicle_id && (
            <div className="mb-4">
              <FromAD360Button
                vehicleId={form.vehicle_id}
                tenantId={1}
                onItemsLoaded={(ad360Items) => {
                  // Store AD360 items in state for use in autocomplete
                  setAd360Items(ad360Items);
                  setAd360Mode(true);
                }}
                onError={(error) => {
                  setError(`AD360 Error: ${error}`);
                }}
              />
              
              {/* Mode Toggle */}
              {ad360Items.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-600">Parts Source:</span>
                  <button
                    type="button"
                    onClick={() => setAd360Mode(false)}
                    className={`px-3 py-1 text-sm rounded border ${
                      !ad360Mode 
                        ? 'bg-blue-100 text-blue-700 border-blue-300' 
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Internal Parts
                  </button>
                  <button
                    type="button"
                    onClick={() => setAd360Mode(true)}
                    className={`px-3 py-1 text-sm rounded border ${
                      ad360Mode 
                        ? 'bg-green-100 text-green-700 border-green-300' 
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    AD360 Parts
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-11 gap-2 mb-2 font-semibold text-sm">
            <div>Part #</div>
            <div className="col-span-4">Description</div>
            <div>Qty</div>
            <div>Unit Cost</div>
            <div>Markup %</div>
            <div>Unit Price</div>
            <div>Line Price</div>
            <div>Action</div>
          </div>
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-11 gap-2 mb-2">
              {ad360Mode && ad360Items.length > 0 ? (
                <AD360Autocomplete
                  value={it.part_number}
                  onChange={v => changeItem(i, 'part_number', v)}
                  onSelect={item => {
                    changeItem(i, 'part_number', item.partNumber || '');
                    changeItem(i, 'part_id', ''); // No internal part ID for AD360 items
                    changeItem(i, 'description', item.description || '');
                    changeItem(i, 'unit_cost', item.price?.amount || 0);
                    // Set default quantity to 1 if not already set
                    if (!it.qty) changeItem(i, 'qty', '1');
                    // Set default markup to 0 if not already set
                    if (!it.markup) changeItem(i, 'markup', '0');
                  }}
                  vehicleId={form.vehicle_id}
                  tenantId={1}
                  placeholder="Search AD360 parts..."
                />
              ) : (
                <PartAutocomplete
                  value={it.part_number}
                  description={it.description}
                  unit_cost={it.unit_cost}
                  onChange={v => changeItem(i, 'part_number', v)}
                  onSelect={p => {
                    changeItem(i, 'part_number', p.part_number || '');
                    changeItem(i, 'part_id', p.id || '');
                    changeItem(i, 'description', p.description || '');
                    changeItem(i, 'unit_cost', p.unit_cost || 0);
                    // Set default quantity to 1 if not already set
                    if (!it.qty) changeItem(i, 'qty', '1');
                    // Set default markup to 0 if not already set
                    if (!it.markup) changeItem(i, 'markup', '0');
                  }}
                />
              )}
              <div className="col-span-4">
                <DescriptionAutocomplete
                  value={it.description}
                  onChange={v => changeItem(i, 'description', v)}
                  onSelect={p => {
                    changeItem(i, 'part_number', p.part_number || '');
                    changeItem(i, 'part_id', p.id || '');
                    changeItem(i, 'description', p.description || '');
                    changeItem(i, 'unit_cost', p.unit_cost || 0);
                    // Set default quantity to 1 if not already set
                    if (!it.qty) changeItem(i, 'qty', '1');
                    // Set default markup to 0 if not already set
                    if (!it.markup) changeItem(i, 'markup', '0');
                  }}
                />
              </div>
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
              <input
                type="text"
                className="input-readonly"
                placeholder="Unit Price"
                value={formatEuro(it.price)}
                readOnly
              />
              <input
                type="text"
                className="input-readonly"
                placeholder="Line Price"
                value={formatEuro((Number(it.qty) || 0) * (Number(it.price) || 0))}
                readOnly
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="button-secondary px-2"
                disabled={items.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No items added yet. Click "Add Item" to get started.
            </div>
          )}
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
            onClick={clearDraft}
            className="button-secondary"
          >
            Clear Form
          </button>
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
