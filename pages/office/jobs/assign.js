import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchEngineers } from '../../../lib/engineers';

export default function AssignJobPage() {
  const router = useRouter();
  const { id } = router.query;
  const [engineers, setEngineers] = useState([]);
  const [form, setForm] = useState({ engineer_id: '', scheduled_start: '', scheduled_end: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEngineers()
      .then(setEngineers)
      .catch(() => setEngineers([]));
  }, []);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/jobs/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      router.push(`/office/jobs/${id}`);
    } catch {
      setError('Failed to assign engineer');
    }
  };

  if (!id) return <OfficeLayout><p>Loading…</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Assign Engineer</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-sm">
        <div>
          <label className="block mb-1">Engineer</label>
          <select
            name="engineer_id"
            value={form.engineer_id}
            onChange={change}
            className="input w-full"
            required
          >
            <option value="">Select…</option>
            {engineers.map(e => (
              <option key={e.id} value={e.id}>{e.username}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Scheduled Start</label>
          <input
            type="datetime-local"
            name="scheduled_start"
            value={form.scheduled_start}
            onChange={change}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Scheduled End</label>
          <input
            type="datetime-local"
            name="scheduled_end"
            value={form.scheduled_end}
            onChange={change}
            className="input w-full"
            required
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="button">Assign</button>
          <Link href={`/office/jobs/${id}`} className="button-secondary">Cancel</Link>
        </div>
      </form>
    </OfficeLayout>
  );
}
