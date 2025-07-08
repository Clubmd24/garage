import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import logout from '../../../lib/logout.js';

export default function FleetNewVehicle() {
  const router = useRouter();
  const [fleet, setFleet] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    licence_plate: '',
    make: '',
    model: '',
    color: '',
    company_vehicle_id: '',
    service_date: '',
    itv_date: '',
  });

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/portal/fleet/me');
      if (!res.ok) return router.replace('/fleet/login');
      const f = await res.json();
      setFleet(f);
    })();
  }, [router]);

  function change(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, fleet_id: fleet.id }),
    });
    if (res.ok) {
      setMessage('Vehicle added');
      setForm({ licence_plate: '', make: '', model: '', color: '', company_vehicle_id: '', service_date: '', itv_date: '' });
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/fleet/login');
    }
  }

  if (!fleet) return <p className="p-8">Loading…</p>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Add Vehicle</h1>
        <button onClick={handleLogout} className="button-secondary px-4">Logout</button>
      </div>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-sm">
        {['licence_plate','make','model','color','company_vehicle_id','service_date','itv_date'].map(field => (
          <input
            key={field}
            name={field}
            value={form[field]}
            onChange={change}
            type={field.includes('date') ? 'date' : 'text'}
            placeholder={field.replace('_',' ')}
            className="input w-full"
          />
        ))}
        <button type="submit" className="button">Save</button>
      </form>
    </div>
  );
}
