import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import Card from '../../components/Card';

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function EngineerWiki() {
  const [jobs, setJobs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [jRes, hRes] = await Promise.all([
          fetch('/api/engineer/jobs', { credentials: 'include' }),
          fetch('/api/engineer/holiday-requests', { credentials: 'include' }),
        ]);
        if (!jRes.ok || !hRes.ok) throw new Error('Failed to load data');
        const jData = await jRes.json();
        const hData = await hRes.json();
        setJobs(Array.isArray(jData) ? jData : []);
        setRequests(Array.isArray(hData) ? hData : []);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const numDays = daysInMonth(year, month);
  const days = Array.from({ length: numDays }, (_, i) => new Date(year, month, i + 1));

  function isHoliday(date) {
    return requests.some((r) => {
      const s = new Date(r.start_date);
      const e = new Date(r.end_date);
      return date >= s && date <= e;
    });
  }

  function jobsForDay(date) {
    return jobs.filter((j) => {
      if (!j.scheduled_start) return false;
      const d = new Date(j.scheduled_start);
      return d.toDateString() === date.toDateString();
    });
  }

  const daysTaken = requests.reduce((acc, r) => {
    const s = new Date(r.start_date);
    const e = new Date(r.end_date);
    const diff = Math.round((e - s) / 86400000) + 1;
    return acc + diff;
  }, 0);
  const remaining = 20 - daysTaken;

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Engineer Wiki</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Holiday Summary</h2>
        <p>You have {remaining} days of holiday remaining this year.</p>
      </Card>
      <h2 className="text-xl font-semibold mb-2">Monthly Calendar</h2>
      <p className="mb-4">
        Days marked &quot;Holiday&quot; are your approved time off. Other days list any
        jobs scheduled to start on that date.
      </p>
      <div className="grid grid-cols-7 gap-2 text-sm">
        {days.map((d) => (
          <Card key={d.toISOString()} className="p-2">
            <div className="font-semibold mb-1">{d.getDate()}</div>
            {isHoliday(d) ? (
              <div className="text-red-500">Holiday</div>
            ) : (
              jobsForDay(d).map((j) => (
                <div key={j.id}>Job #{j.id}</div>
              ))
            )}
          </Card>
        ))}
      </div>
    </Layout>
  );
}
