import { useEffect, useState } from 'react';
import OfficeLayout from '../../../components/OfficeLayout.jsx';

export default function AttendanceOverview() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    fetch('/api/hr/attendance')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setRecords)
      .catch(() => setError('Failed to load records'));
  };

  useEffect(load, [load]);

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Attendance Overview</h1>
      {error && <p className="text-red-500">{error}</p>}
      <table className="mb-4 table-auto w-full">
        <thead>
          <tr>
            <th className="px-2 py-1">Employee</th>
            <th className="px-2 py-1">Clock In</th>
            <th className="px-2 py-1">Clock Out</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id}>
              <td className="px-2 py-1">{r.employee_id}</td>
              <td className="px-2 py-1">{r.clock_in}</td>
              <td className="px-2 py-1">{r.clock_out}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </OfficeLayout>
  );
}
