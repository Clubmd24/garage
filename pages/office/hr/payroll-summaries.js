import { useEffect, useState } from 'react';
import OfficeLayout from '../../../components/OfficeLayout.jsx';

export default function PayrollSummaries() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    fetch('/api/hr/payroll')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setEntries)
      .catch(() => setError('Failed to load payroll entries'));
  };

  useEffect(load, []);

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Payroll Summaries</h1>
      {error && <p className="text-red-500">{error}</p>}
      <table className="mb-4 table-auto w-full">
        <thead>
          <tr>
            <th className="px-2 py-1">Employee</th>
            <th className="px-2 py-1">Amount</th>
            <th className="px-2 py-1">Pay Date</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.id}>
              <td className="px-2 py-1">{e.employee_id}</td>
              <td className="px-2 py-1">€{e.amount}</td>
              <td className="px-2 py-1">{e.pay_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </OfficeLayout>
  );
}
