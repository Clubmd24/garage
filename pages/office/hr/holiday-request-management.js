import { useEffect, useState } from 'react';
import OfficeLayout from '../../../components/OfficeLayout.jsx';

export default function HolidayRequestManagement() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    fetch('/api/hr/holiday-requests')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setRequests)
      .catch(() => setError('Failed to load requests'));
  };

  useEffect(load, []);

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Holiday Request Management</h1>
      {error && <p className="text-red-500">{error}</p>}
      <table className="mb-4 table-auto w-full">
        <thead>
          <tr>
            <th className="px-2 py-1">Employee</th>
            <th className="px-2 py-1">Start</th>
            <th className="px-2 py-1">End</th>
            <th className="px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id}>
              <td className="px-2 py-1">{r.employee_id}</td>
              <td className="px-2 py-1">{r.start_date}</td>
              <td className="px-2 py-1">{r.end_date}</td>
              <td className="px-2 py-1">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </OfficeLayout>
  );
}
