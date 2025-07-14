import { useState, useEffect } from 'react';
import EmployeeAutocomplete from './EmployeeAutocomplete.jsx';

export default function HrShiftForm({ onSubmit, initialData }) {
  const [form, setForm] = useState({ employee_id: '', start_time: '', end_time: '' });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = e => {
    e.preventDefault();
    onSubmit?.(form);
    setForm({ employee_id: '', start_time: '', end_time: '' });
  };

  return (
    <form onSubmit={submit} className="space-y-2 max-w-md mb-4">
      <div>
        <label className="block mb-1">Employee</label>
        <EmployeeAutocomplete
          onSelect={e => setForm(f => ({ ...f, employee_id: e.id }))}
        />
      </div>
      <div>
        <label className="block mb-1">Start Time</label>
        <input type="datetime-local" name="start_time" value={form.start_time} onChange={change} className="input w-full" />
      </div>
      <div>
        <label className="block mb-1">End Time</label>
        <input type="datetime-local" name="end_time" value={form.end_time} onChange={change} className="input w-full" />
      </div>
      <button type="submit" className="button">Save</button>
    </form>
  );
}
