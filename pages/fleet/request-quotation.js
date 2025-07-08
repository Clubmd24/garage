import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import logout from '../../lib/logout.js';
import { fetchVehicles } from '../../lib/vehicles';
import { createQuote } from '../../lib/quotes';

export default function FleetRequestQuotation() {
  const router = useRouter();
  const [fleet, setFleet] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
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
    try {
      await createQuote({ fleet_id: fleet.id, vehicle_id: vehicleId, status: 'new' });
      router.push('/fleet/quotes');
    } catch {
      setMessage('Failed to submit request');
    }
  }

  if (!fleet) return <p className="p-8">Loading…</p>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Request Quotation</h1>
        <button onClick={handleLogout} className="button-secondary px-4">Logout</button>
      </div>
      <Link href="/fleet/vehicles/new" className="button inline-block mb-4 mr-2">
        Add Vehicle
      </Link>
      <Link href="/fleet/home" className="button inline-block mb-4">
        Return to Home
      </Link>
      {message && <p className="text-red-500 mb-2">{message}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-sm">
        <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="input w-full" required>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.licence_plate}</option>
          ))}
        </select>
        <button type="submit" className="button">Request Quote</button>
      </form>
    </div>
  );
}
