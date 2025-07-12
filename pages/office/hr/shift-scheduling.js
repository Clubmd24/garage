import { useEffect, useState } from 'react';
import OfficeLayout from '../../../components/OfficeLayout.jsx';
import HrShiftForm from '../../../components/HrShiftForm.jsx';
import HrShiftTable from '../../../components/HrShiftTable.jsx';

export default function ShiftSchedulingPage() {
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    fetch('/api/hr/shifts')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setShifts)
      .catch(() => setError('Failed to load shifts'));
  };

  useEffect(load, [load]);

  const addShift = async data => {
    try {
      await fetch('/api/hr/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      load();
    } catch {
      setError('Failed to create shift');
    }
  };

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Shift Scheduling</h1>
      {error && <p className="text-red-500">{error}</p>}
      <HrShiftForm onSubmit={addShift} />
      <HrShiftTable shifts={shifts} />
    </OfficeLayout>
  );
}
