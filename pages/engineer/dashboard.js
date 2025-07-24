import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { fetchDashboardData } from '../../lib/engineerDashboard.js';

export default function EngineerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch(() => setError('Failed to load dashboard'));
  }, []);

  if (!data && !error) return <Layout><p>Loading…</p></Layout>;
  if (error) return <Layout><p className="text-red-500">{error}</p></Layout>;

  const todayStr = new Date().toDateString();
  const todaysJobs = data.jobs.filter(j => j.scheduled_start && new Date(j.scheduled_start).toDateString() === todayStr);
  const upcomingRequests = data.holidays.filter(h => new Date(h.start_date) >= new Date());
  const upcomingShifts = data.shifts
    .filter(s => new Date(s.start_time) >= new Date())
    .sort((a,b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0,5);
  const myAttendance = data.attendance.filter(a => String(a.employee_id) === String(data.user.id));

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Engineer Dashboard</h1>
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Today's Jobs</h2>
        {todaysJobs.length === 0 ? (
          <p>No jobs today.</p>
        ) : (
          <ul className="list-disc pl-5">
            {todaysJobs.map(j => (
              <li key={j.id}>Job #{j.id}</li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Holiday</h2>
        <p className="mb-2">Remaining days: {data.remainingDays}</p>
        {upcomingRequests.length === 0 ? (
          <p>No upcoming requests.</p>
        ) : (
          <ul className="list-disc pl-5">
            {upcomingRequests.map(r => (
              <li key={r.id}>{r.start_date} to {r.end_date} - {r.status}</li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-2">HR File</h2>
        <p>Name: {data.user.username}</p>
        <p>Email: {data.user.email}</p>
        <h3 className="text-lg font-semibold mt-4">Attendance</h3>
        {myAttendance.length === 0 ? (
          <p>No records</p>
        ) : (
          <ul className="list-disc pl-5">
            {myAttendance.map(r => (
              <li key={r.id}>{r.clock_in} - {r.clock_out || 'present'}</li>
            ))}
          </ul>
        )}
      </Card>
      <Card>
        <h2 className="text-xl font-semibold mb-2">Upcoming Shifts</h2>
        {upcomingShifts.length === 0 ? (
          <p>No upcoming shifts.</p>
        ) : (
          <ul className="list-disc pl-5">
            {upcomingShifts.map(s => (
              <li key={s.id}>{s.start_time} - {s.end_time}</li>
            ))}
          </ul>
        )}
      </Card>
    </Layout>
  );
}
