import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';

export default function EngineerHome() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [entry, setEntry] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      const r = await fetch('/api/engineer/jobs', { credentials: 'include' });
      if (!r.ok) throw new Error('Failed to load jobs');
      const data = await r.json();
      setJobs(Array.isArray(data) ? data : []);
      if (data.length) setSelectedJob(data[0].id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function clockIn() {
    if (!selectedJob) return;
    try {
      const r = await fetch('/api/engineer/time-entries?action=clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ job_id: selectedJob }),
      });
      if (r.ok) {
        const e = await r.json();
        setEntry(e);
        setMessage('Clocked in');
      }
    } catch {
      setMessage('Clock in failed');
    }
  }

  async function clockOut() {
    if (!entry) return;
    try {
      const r = await fetch('/api/engineer/time-entries?action=clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ entry_id: entry.id }),
      });
      if (r.ok) {
        await r.json();
        setEntry(null);
        setMessage('Clocked out');
      }
    } catch {
      setMessage('Clock out failed');
    }
  }

  async function requestHoliday() {
    const start = prompt('Start date (YYYY-MM-DD)');
    const end = start ? prompt('End date (YYYY-MM-DD)') : null;
    if (!start || !end) return;
    try {
      await fetch('/api/engineer/holiday-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ start_date: start, end_date: end }),
      });
      setMessage('Holiday request submitted');
    } catch {
      setMessage('Request failed');
    }
  }

  async function completeJob(jobId) {
    setError('');
    setMessage('');
    try {
      const r = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'engineer completed' }),
      });
      if (!r.ok) throw new Error('Failed to update job');
      setMessage('Job completed');
      await loadJobs();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Engineer Portal</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Allocated Jobs</h2>
        {!jobs.length ? (
          <p>No jobs assigned.</p>
        ) : (
          <div>
            <select
              className="input mb-4 w-full text-black dark:text-white"
              value={selectedJob}
              onChange={(e) => setSelectedJob(Number(e.target.value))}
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  Job #{j.id}
                </option>
              ))}
            </select>
            <ul className="space-y-2">
              {jobs.map((j) => (
                <li
                  key={j.id}
                  className="flex items-center justify-between text-black dark:text-white"
                >
                  <Link href={`/engineer/jobs/${j.id}`}>Job #{j.id}</Link>
                  <button
                    onClick={() => completeJob(j.id)}
                    className="button-secondary px-3 py-1"
                  >
                    Complete Job
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
      {message && <p className="mb-4 text-green-500">{message}</p>}
    </Layout>
  );
}
