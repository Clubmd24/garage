import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { fetchVehicles } from '../../lib/vehicles';
import logout from '../../lib/logout.js';

export default function FleetRequestJob() {
  const router = useRouter();
  const [fleet, setFleet] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/fleet/login');
    }
  }

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/portal/fleet/me');
      if (!res.ok) return router.replace('/fleet/login');
      const f = await res.json();
      setFleet(f);
      const veh = await fetchVehicles(null, f.id);
      setVehicles(veh);
    })();
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    const res = await fetch('/api/job-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicle_id: vehicleId, description }),
    });
    if (res.ok) {
      setMessage('Request submitted');
      setVehicleId('');
      setDescription('');
    }
  }

  if (!fleet) return <p className="p-8">Loading…</p>;

  return (
    <div className="p-8">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">New Job Request</h1>
        <button onClick={handleLogout} className="button-secondary px-4">Logout</button>
      </div>
      <Link href="/fleet/home" className="button inline-block mb-4">
        Return to Home
      </Link>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-sm">
        <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="input w-full" required>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.licence_plate}</option>
          ))}
        </select>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="input w-full"
          placeholder="Description"
        />
        <button type="submit" className="button">Submit</button>
      </form>
    </div>
  );
}
