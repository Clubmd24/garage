import { useEffect, useState } from 'react';
import OfficeLayout from '../../../components/OfficeLayout.jsx';
import HrShiftForm from '../../../components/HrShiftForm.jsx';
import HrShiftTable from '../../../components/HrShiftTable.jsx';
import EmployeeAutocomplete from '../../../components/EmployeeAutocomplete.jsx';

export default function ShiftSchedulingPage() {
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState('');
  const [filterId, setFilterId] = useState('');
  const [editing, setEditing] = useState(null);

  const load = () => {
    fetch('/api/hr/shifts')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setShifts)
      .catch(() => setError('Failed to load shifts'));
  };

  useEffect(load, []);

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

  const updateShift = async data => {
    try {
      await fetch('/api/hr/shifts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setEditing(null);
      load();
    } catch {
      setError('Failed to update shift');
    }
  };

  const removeShift = async id => {
    if (!confirm('Delete this shift?')) return;
    await fetch('/api/hr/shifts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const copyShift = async s => {
    const countStr = prompt('Copy for how many additional days?');
    const count = parseInt(countStr, 10);
    if (!count || count < 1) return;
    const start = new Date(s.start_time);
    const end = new Date(s.end_time);
    for (let i = 1; i <= count; i++) {
      const newStart = new Date(start.getTime() + 86400000 * i);
      const newEnd = new Date(end.getTime() + 86400000 * i);
      await fetch('/api/hr/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: s.employee_id,
          start_time: newStart.toISOString().slice(0, 16),
          end_time: newEnd.toISOString().slice(0, 16),
        }),
      });
    }
    load();
  };

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Shift Scheduling</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <EmployeeAutocomplete onSelect={e => setFilterId(e.id)} />
      </div>
      <HrShiftForm
        onSubmit={editing ? updateShift : addShift}
        initialData={editing || undefined}
      />
      {editing && (
        <button className="button mb-4" onClick={() => setEditing(null)}>
          Cancel Edit
        </button>
      )}
      <HrShiftTable
        shifts={filterId ? shifts.filter(s => String(s.employee_id) === String(filterId)) : shifts}
        onEdit={s => setEditing(s)}
        onDelete={s => removeShift(s.id)}
        onCopy={copyShift}
      />
    </OfficeLayout>
  );
}
