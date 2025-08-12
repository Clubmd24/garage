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
  const [clientVehicles, setClientVehicles] = useState([]); // Add this state
  const SAVE_KEY = 'quote_draft';

  // Load fleets
  useEffect(() => {
    fetchFleets().then(setFleets);
  }, []);

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
          setSelectedVehicleDisplay(`${v.licence_plate || 'No Plate'} - ${v.make} ${v.model}`);
          if (v.customer_id && !form.customer_id) {
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
            setForm(f => ({ ...f, fleet_id: v.fleet_id, customer_id: '' }));
            // Fetch fleet name for display
            const fleet = fleets.find(f => f.id === v.fleet_id);
            if (fleet) {
              setClientName(fleet.company_name);
            }
          }
        } catch {
          setVehicleError('Failed to load vehicle');
        }
      }
    }
    load();
  }, [router.isReady, router.query, fleets]);

  // Debug logging for vehicle data changes
  useEffect(() => {
    console.log('Vehicle data changed:', {
      vehicle_id: form.vehicle_id,
      selectedVehicleDisplay,
      clientVehicles: clientVehicles.length
    });
  }, [form.vehicle_id, selectedVehicleDisplay, clientVehicles]);

  // Helper function to get consistent vehicle display text
  const getVehicleDisplayText = () => {
    if (!form.vehicle_id) return '';
    
    // First check if we have the vehicle in clientVehicles
    if (clientVehicles.length > 0) {
      const vehicle = clientVehicles.find(v => v.id === form.vehicle_id);
      if (vehicle) {
        return `${vehicle.licence_plate || 'No Plate'} - ${vehicle.make} ${vehicle.model}`;
      }
    }
    
    // Fallback to selectedVehicleDisplay
    return selectedVehicleDisplay;
  };

  const clearForm = () => {
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
    setItems([emptyItem]);
    setAd360Items([]);
    setAd360Mode(false);
    setClientVehicles([]); // Clear client vehicles
    setError(null);
    setVehicleError(null);
  };

  const handleClientSelect = (client) => {
    console.log('handleClientSelect called with:', client); // Debug log
    setClientName(client.displayName || `${client.first_name || ''} ${client.last_name || ''}`.trim());
    setForm(f => ({ ...f, customer_id: client.id, fleet_id: '' }));
    setMode('client');
    
    // Set client vehicles for potential dropdown
    setClientVehicles(client.vehicles || []);
    
    // Handle vehicle auto-population based on client's vehicles
    if (client.vehicles && client.vehicles.length > 0) {
      if (client.vehicles.length === 1) {
        // Auto-populate if client has only one vehicle
        const vehicle = client.vehicles[0];
        console.log('Auto-populating vehicle:', vehicle);
        console.log('Vehicle ID:', vehicle.id);
        console.log('Vehicle license plate:', vehicle.licence_plate);
        console.log('Vehicle make/model:', vehicle.make, vehicle.model);
        
        setSelectedVehicleDisplay(`${vehicle.licence_plate || 'No Plate'} - ${vehicle.make} ${vehicle.model}`);
        setForm(f => ({ ...f, vehicle_id: vehicle.id }));
        console.log('Auto-populated vehicle:', vehicle);
      } else {
        // Clear vehicle selection if client has multiple vehicles
        // User will need to choose from dropdown
        setForm(f => ({ ...f, vehicle_id: '' }));
        setSelectedVehicleDisplay('');
        console.log('Client has multiple vehicles, cleared selection');
      }
    } else {
      // Clear vehicle if client has no vehicles
      setForm(f => ({ ...f, vehicle_id: '' }));
      setSelectedVehicleDisplay('');
      setClientVehicles([]);
      console.log('Client has no vehicles, cleared selection');
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicleDisplay(`${vehicle.licence_plate || 'No Plate'} - ${vehicle.make} ${vehicle.model}`);
    setForm(f => ({ ...f, vehicle_id: vehicle.id }));
    
    // Auto-populate client if vehicle has one
    if (vehicle.customer_id && !form.customer_id) {
      setMode('client');
      setForm(f => ({ ...f, customer_id: vehicle.customer_id }));
      // Fetch and set client name
      fetchClient(vehicle.customer_id).then(client => {
        setClientName(`${client.first_name || ''} ${client.last_name || ''}`.trim());
      }).catch(() => {
        // Ignore errors, client might not exist
      });
    } else if (vehicle.fleet_id && vehicle.fleet_id !== 2) {
      setMode('fleet');
      setForm(f => ({ ...f, fleet_id: vehicle.fleet_id, customer_id: '' }));
      const fleet = fleets.find(f => f.id === vehicle.fleet_id);
      if (fleet) {
        setClientName(fleet.company_name);
      }
    }
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
            part_number: it.part_number || null,
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

  const addItem = () => {
    setItems([...items, emptyItem]);
  };

  const removeItem = (i) => {
    setItems(items.filter((_, index) => index !== i));
  };

  return (
    <OfficeLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">New Quotation</h1>
            <button
              onClick={() => router.push('/office/quotations')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to Quotes
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            {/* Client & Vehicle Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Client & Vehicle</h2>
              
              {/* Mode Toggle */}
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('client');
                    // Clear fleet-related state
                    setForm(f => ({ ...f, fleet_id: '' }));
                    setClientVehicles([]);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    mode === 'client'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Individual Client
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('fleet');
                    // Clear client-related state
                    setForm(f => ({ ...f, customer_id: '' }));
                    setClientName('');
                    setClientVehicles([]);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    mode === 'fleet'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Fleet Company
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client/Fleet Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {mode === 'client' ? 'Client' : 'Fleet Company'} *
                  </label>
                  {mode === 'client' ? (
                    <ClientAutocomplete
                      value={clientName}
                      onChange={setClientName}
                      onSelect={handleClientSelect}
                      placeholder={`Search by ${mode === 'client' ? 'client name or email' : 'fleet company name'}`}
                    />
                  ) : (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={form.fleet_id}
                      onChange={e => {
                        const fleetId = e.target.value;
                        setForm(f => ({ ...f, fleet_id: fleetId, customer_id: '' }));
                        if (fleetId) {
                          const fleet = fleets.find(f => f.id === parseInt(fleetId));
                          if (fleet) {
                            setClientName(fleet.company_name);
                          }
                        } else {
                          setClientName('');
                        }
                      }}
                    >
                      <option value="">Select fleet company</option>
                      {fleets.filter(f => f.id !== 2).map(f => (
                        <option key={f.id} value={f.id}>
                          {f.company_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle *
                  </label>
                  <VehicleAutocomplete
                    value={selectedVehicleDisplay}
                    onChange={setSelectedVehicleDisplay}
                    onSelect={handleVehicleSelect}
                    customerId={form.customer_id}
                    fleetId={form.fleet_id}
                    placeholder="Search by license plate or VIN"
                  />
                </div>
              </div>

              {/* Vehicle Dropdown for Multiple Client Vehicles */}
              {mode === 'client' && clientVehicles.length > 1 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Client Vehicle
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    value={form.vehicle_id || ''}
                    onChange={(e) => {
                      const vehicleId = e.target.value;
                      if (vehicleId) {
                        const vehicle = clientVehicles.find(v => v.id === parseInt(vehicleId));
                        if (vehicle) {
                          setSelectedVehicleDisplay(`${vehicle.licence_plate || 'No Plate'} - ${vehicle.make} ${vehicle.model}`);
                          setForm(f => ({ ...f, vehicle_id: vehicle.id }));
                          console.log('Selected vehicle from dropdown:', vehicle);
                        }
                      } else {
                        setSelectedVehicleDisplay('');
                        setForm(f => ({ ...f, vehicle_id: '' }));
                      }
                    }}
                  >
                    <option value="">Choose a vehicle...</option>
                    {clientVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.licence_plate || 'No Plate'} - {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Selected Client & Vehicle Display */}
              {(clientName || selectedVehicleDisplay) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  {clientName && (
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Selected {mode === 'client' ? 'Client' : 'Fleet'}:</span> {clientName}
                    </div>
                  )}
                  {getVehicleDisplayText() && (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Selected Vehicle:</span> {getVehicleDisplayText()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Customer Reference & PO Number */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Reference Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Ref #
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    value={form.customer_ref}
                    onChange={e =>
                      setForm(f => ({ ...f, customer_ref: e.target.value }))
                    }
                    placeholder="Optional customer reference"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PO Number
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    value={form.po_number}
                    onChange={e =>
                      setForm(f => ({ ...f, po_number: e.target.value }))
                    }
                    placeholder="Optional purchase order number"
                  />
                </div>
              </div>
            </div>

            {/* Defect Description */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Work Description</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Defect Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                  rows={4}
                  value={form.defect_description}
                  onChange={e =>
                    setForm(f => ({ ...f, defect_description: e.target.value }))
                  }
                  placeholder="Describe the work to be done..."
                />
              </div>
            </div>

            {/* Item Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Item Details</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Item
                </button>
              </div>
              
              {/* AD360 Integration */}
              {form.vehicle_id && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">AD360 Parts Integration</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    Debug: Vehicle ID = {form.vehicle_id}, Vehicle Display = {selectedVehicleDisplay}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Debug: ad360Mode = {ad360Mode ? 'true' : 'false'}, ad360Items.length = {ad360Items.length}
                  </div>
                  <FromAD360Button
                    vehicleId={form.vehicle_id}
                    tenantId={1}
                    onItemsLoaded={(ad360Items) => {
                      console.log('AD360 items loaded:', ad360Items);
                      setAd360Items(ad360Items);
                      setAd360Mode(true);
                    }}
                    onError={(error) => {
                      setError(`AD360 Error: ${error}`);
                    }}
                  />
                  
                  {/* Debug Info for Parts Display */}
                  {ad360Items.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        <strong>✅ AD360 Parts Loaded:</strong> {ad360Items.length} parts available
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Parts should now be available in the dropdown below. If not visible, check ad360Mode.
                      </p>
                    </div>
                  )}
                  
                  {/* Mode Toggle */}
                  {ad360Items.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
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
              
              {/* Item Headers */}
              <div className="flex gap-2 mb-2 font-semibold text-sm">
                <div className="flex-1 min-w-0">Part #</div>
                <div className="flex-2 min-w-0">Description</div>
                <div className="w-16 text-center">Qty</div>
                <div className="w-24 text-center">Unit Cost</div>
                <div className="w-24 text-center">Markup %</div>
                <div className="w-24 text-center">Unit Price</div>
                <div className="w-24 text-center">Line Price</div>
                <div className="w-20 text-center">Action</div>
              </div>

              {/* Item Rows */}
              {items.map((it, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    {ad360Mode && ad360Items.length > 0 ? (
                                             <AD360Autocomplete
                         value={it.part_number}
                         onChange={v => changeItem(i, 'part_number', v)}
                         onSelect={item => {
                           console.log('AD360 item selected:', item);
                           // AD360 internal reference number maps to our part_number field
                           const partNumber = item.partNumber || item.internalReference || '';
                           const unitCost = typeof item.price === 'object' ? item.price.amount : item.price;
                           console.log('Unit cost from AD360:', unitCost);
                           
                           changeItem(i, 'part_number', partNumber);
                           changeItem(i, 'part_id', '');
                           changeItem(i, 'description', item.description || '');
                           changeItem(i, 'unit_cost', unitCost || 0);
                           
                           if (!it.qty) changeItem(i, 'qty', '1');
                           if (!it.markup) changeItem(i, 'markup', '0');
                           
                           setTimeout(() => {
                             changeItem(i, 'unit_cost', unitCost || 0);
                           }, 100);
                         }}
                         items={ad360Items}
                         placeholder="Search AD360 parts..."
                       />
                    ) : (
                      <PartAutocomplete
                        value={it.part_number}
                        onChange={v => changeItem(i, 'part_number', v)}
                        onSelect={part => {
                          changeItem(i, 'part_id', part.id);
                          changeItem(i, 'part_number', part.part_number);
                          changeItem(i, 'description', part.description);
                          changeItem(i, 'unit_cost', part.unit_cost || 0);
                          if (!it.qty) changeItem(i, 'qty', '1');
                          if (!it.markup) changeItem(i, 'markup', '0');
                        }}
                        placeholder="Search parts..."
                      />
                    )}
                  </div>
                  <div className="flex-2 min-w-0">
                    <DescriptionAutocomplete
                      value={it.description}
                      onChange={v => changeItem(i, 'description', v)}
                      onSelect={desc => {
                        changeItem(i, 'description', desc.description);
                        changeItem(i, 'unit_cost', desc.unit_cost || 0);
                        if (!it.qty) changeItem(i, 'qty', '1');
                        if (!it.markup) changeItem(i, 'markup', '0');
                      }}
                      placeholder="Description"
                    />
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      className="w-full px-2 py-1 text-center border border-gray-300 rounded text-sm text-gray-900 bg-white"
                      value={it.qty}
                      onChange={e => changeItem(i, 'qty', e.target.value)}
                      placeholder="1"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      className="w-full px-2 py-1 text-center border border-gray-300 rounded text-sm text-gray-900 bg-white"
                      value={it.unit_cost}
                      onChange={e => changeItem(i, 'unit_cost', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      className="w-full px-2 py-1 text-center border border-gray-300 rounded text-sm text-gray-900 bg-white"
                      value={it.markup}
                      onChange={e => changeItem(i, 'markup', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      className="w-full px-2 py-1 text-center border border-gray-300 rounded text-sm bg-gray-50"
                      value={it.price ? formatEuro(it.price) : '€0.00'}
                      readOnly
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      className="w-full px-2 py-1 text-center border border-gray-300 rounded text-sm bg-gray-50"
                      value={it.price && it.qty ? formatEuro(it.price * it.qty) : '€0.00'}
                      readOnly
                    />
                  </div>
                  <div className="w-20 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                      disabled={items.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Cost</label>
                  <div className="text-lg font-semibold text-gray-900">{formatEuro(totalCost)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Price</label>
                  <div className="text-lg font-semibold text-gray-900">{formatEuro(total)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Global Markup</label>
                  <div className="text-lg font-semibold text-gray-900">{markupPercent.toFixed(2)}%</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Profit</label>
                  <div className="text-lg font-semibold text-green-600">{formatEuro(profit)}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={clearForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Form
              </button>
              <button
                type="button"
                onClick={() => router.push('/office/quotations')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Quote
              </button>
            </div>
          </form>
        </div>
      </div>
    </OfficeLayout>
  );
}
