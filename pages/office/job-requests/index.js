import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../../components/Layout';

export default function JobRequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch('/api/job-requests')
      .then(r => r.json())
      .then(setRequests)
      .catch(() => setRequests([]));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Job Requests</h1>
      <Link href="/office" className="button mb-4 inline-block">Return to Office</Link>
      <ul className="space-y-2">
        {requests.map(r => (
          <li key={r.id} className="p-2 rounded bg-gray-100 dark:bg-gray-800">
            Request #{r.id} - Vehicle {r.vehicle_id} - {r.description}
          </li>
        ))}
      </ul>
    </Layout>
  );
}
