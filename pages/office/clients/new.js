// pages/office/clients/new.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

const NewClientPage = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    landline: '',
    nie_number: '',
    street_address: '',
    town: '',
    province: '',
    post_code: '',
    password: '',
  });
  const [vehicle, setVehicle] = useState({
    licence_plate: '',
    make: '',
    model: '',
    color: '',
  });
  const [error, setError] = useState(null);
  const router = useRouter();

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      if (vehicle.licence_plate) {
        await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...vehicle, customer_id: created.id }),
        });
      }
      router.push(`/office/clients/${created.id}?pw=${created.password}`);
    } catch {
      setError('Failed to create client');
    }
  };

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const changeVehicle = e => setVehicle(v => ({ ...v, [e.target.name]: e.target.value }));

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">New Client</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
      {[
        'first_name',
        'last_name',
          'email',
          'mobile',
          'landline',
          'nie_number',
          'street_address',
          'town',
        'province',
        'post_code',
        'password',
      ].map(field => (
        <div key={field}>
          <label className="block mb-1">{field.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
          <input
            name={field}
            value={form[field]}
            onChange={change}
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>
      ))}
        <h2 className="text-xl font-semibold mt-6">Vehicle (optional)</h2>
        {['licence_plate','make','model','color'].map(field => (
          <div key={field}>
            <label className="block mb-1">{field.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</label>
            <input
              name={field}
              value={vehicle[field]}
              onChange={changeVehicle}
              className="w-full border px-3 py-2 rounded text-black"
            />
          </div>
        ))}
          <button type="submit" className="button">Save</button>
      </form>
    </OfficeLayout>
  );
};

export default NewClientPage;
