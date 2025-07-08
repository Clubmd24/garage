import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import logout from '../../../lib/logout.js';
import { fetchJobs } from '../../../lib/jobs';
import { formatDateTime } from '../../../lib/datetime.js';

export default function FleetJobs() {
  const router = useRouter();
  const [fleet, setFleet] = useState(null);
  const [jobs, setJobs] = useState([]);

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
      const j = await fetchJobs({ fleet_id: f.id });
      setJobs(j);
    })();
  }, [router]);

  if (!fleet) return <p className="p-8">Loading…</p>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <button onClick={handleLogout} className="button-secondary px-4">Logout</button>
      </div>
      <Link href="/fleet/home" className="button inline-block mb-4">
        Return to Home
      </Link>
      <ul className="list-disc ml-6 space-y-1">
        {jobs.map(j => (
          <li key={j.id}>
            Job #{j.id} - {j.status}
            {j.scheduled_start && (
              <>
                {' '}-{' '}
                {j.scheduled_end
                  ? `Scheduled from ${formatDateTime(j.scheduled_start)} to ${formatDateTime(j.scheduled_end)}`
                  : `Scheduled for ${formatDateTime(j.scheduled_start)}`}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
