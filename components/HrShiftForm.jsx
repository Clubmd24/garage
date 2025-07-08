import { useState } from 'react';

export default function HrShiftForm({ onSubmit }) {
  const [form, setForm] = useState({ employee_id: '', start_time: '', end_time: '' });

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = e => {
    e.preventDefault();
    onSubmit?.(form);
    setForm({ employee_id: '', start_time: '', end_time: '' });
  };

  return (
    <form onSubmit={submit} className="space-y-2 max-w-md mb-4">
      <div>
        <label className="block mb-1">Employee ID</label>
        <input name="employee_id" value={form.employee_id} onChange={change} className="input w-full" />
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
