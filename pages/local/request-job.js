import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchVehicles } from '../../lib/vehicles';
import logout from '../../lib/logout.js';

export default function LocalRequestJob() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/local/login');
    }
  }

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/portal/local/me');
      if (!res.ok) return router.replace('/local/login');
      const c = await res.json();
      setClient(c);
      const veh = await fetchVehicles(c.id, null);
      setVehicles(veh.filter(v => !v.fleet_id));
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

  if (!client) return <p className="p-8">Loading…</p>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">New Job Request</h1>
        <button onClick={handleLogout} className="button-secondary px-4">Logout</button>
      </div>
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
