import React, { useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

const NewVehiclePage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    licence_plate: '',
    make: '',
    model: '',
    color: '',
    vin_number: '',
    company_vehicle_id: '',
    customer_id: router.query.customer_id || '',
    fleet_id: '',
    service_date: '',
    itv_date: '',
  });
  const [error, setError] = useState(null);

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      router.push('/office/vehicles');
    } catch {
      setError('Failed to create vehicle');
    }
  };

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">New Vehicle</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        {['licence_plate','make','model','color','vin_number','company_vehicle_id','customer_id','fleet_id','service_date','itv_date'].map(field => (
          <div key={field}>
            <label className="block mb-1">{field.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</label>
            <input
              name={field}
              value={form[field]}
              onChange={change}
              type={field.includes('date') ? 'date' : 'text'}
              className="w-full border px-3 py-2 rounded text-black"
            />
          </div>
        ))}
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
};

export default NewVehiclePage;
