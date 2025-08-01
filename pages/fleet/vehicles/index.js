import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import logout from '../../../lib/logout.js';
import { fetchVehicles } from '../../../lib/vehicles';

export default function FleetVehicles() {
  const router = useRouter();
  const [fleet, setFleet] = useState(null);
  const [vehicles, setVehicles] = useState([]);

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

  if (!fleet) return <p className="p-8">Loading…</p>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <button onClick={handleLogout} className="button-secondary px-4">Logout</button>
      </div>
      <Link href="/fleet/vehicles/new" className="button inline-block mb-4 mr-2">
        Add Vehicle
      </Link>
      <Link href="/fleet/home" className="button inline-block mb-4">
        Return to Home
      </Link>
      <ul className="list-disc ml-6 space-y-1">
        {vehicles.map(v => (
          <li key={v.id}>
            {v.licence_plate} - {v.make} {v.model}
            <Link href={`/fleet/vehicles/${v.id}`} className="underline ml-2">View Details</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
