import { useEffect, useState } from 'react';
import OfficeLayout from '../../../components/OfficeLayout';

export default function JobRequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch('/api/job-requests', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setRequests)
      .catch(() => setRequests([]));
  }, []);

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Job Requests</h1>
      <ul className="space-y-2">
        {requests.map(r => (
          <li key={r.id} className="p-2 rounded bg-gray-100 dark:bg-gray-800">
            Request #{r.id} - Vehicle {r.vehicle_id} - {r.description}
          </li>
        ))}
      </ul>
    </OfficeLayout>
  );
}
