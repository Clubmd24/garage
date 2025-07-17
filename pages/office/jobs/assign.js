import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchEngineers } from '../../../lib/engineers';
import { fetchJob } from '../../../lib/jobs';

export default function AssignJobPage() {
  const router = useRouter();
  const { id } = router.query;
  const [engineers, setEngineers] = useState([]);
  const [form, setForm] = useState({
    engineer_id: '',
    scheduled_start: '',
    duration: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngineers()
      .then(setEngineers)
      .catch(() => setEngineers([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const job = await fetchJob(id);
        const duration =
          job.scheduled_start && job.scheduled_end
            ? Math.round(
                (new Date(job.scheduled_end) - new Date(job.scheduled_start)) /
                  60000
              )
            : '';
        setForm({
          engineer_id:
            Array.isArray(job.assignments) && job.assignments.length > 0
              ? job.assignments[0].user_id
              : '',
          scheduled_start: job.scheduled_start
            ? job.scheduled_start.slice(0, 16)
            : '',
          duration: duration ? String(duration) : '',
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    try {
      let scheduled_end = '';
      if (form.duration && form.scheduled_start) {
        const start = new Date(form.scheduled_start);
        if (!Number.isNaN(start.getTime())) {
          const end = new Date(start.getTime() + Number(form.duration) * 60000);
          scheduled_end = end.toISOString().slice(0, 16);
        }
      }
      const data = {
        engineer_id: form.engineer_id,
        scheduled_start: form.scheduled_start,
        scheduled_end,
        duration: form.duration,
      };
      const res = await fetch(`/api/jobs/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      router.push(`/office/jobs/${id}`);
    } catch {
      setError('Failed to assign engineer');
    }
  };

  if (!id || loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">
        {form.engineer_id ? 'Edit Assignment' : 'Assign Engineer'}
      </h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-sm">
        <div>
          <label className="block mb-1">Engineer</label>
          <select
            name="engineer_id"
            value={form.engineer_id}
            onChange={change}
            className="input w-full"
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
          />
        </div>
        <div>
          <label className="block mb-1">Duration (minutes)</label>
          <input
            type="number"
            step="30"
            min="30"
            name="duration"
            value={form.duration}
            onChange={change}
            className="input w-full"
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
