import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import logout from '../../../lib/logout.js';

export default function FleetJobs() {
  const router = useRouter();
  const [fleet, setFleet] = useState(null);

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
    })();
  }, [router]);

  if (!fleet) return <p className="p-8">Loading…</p>;

  return (
    <div className="p-8">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <button onClick={handleLogout} className="button-secondary px-4">Logout</button>
      </div>
      <Link href="/fleet/home" className="button inline-block mb-4">
        Return to Home
      </Link>
      <p>Coming soon.</p>
    </div>
  );
}
