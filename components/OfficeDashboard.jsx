import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { fetchQuotes } from '../lib/quotes';
import { fetchJobs, fetchJobsForDate } from '../lib/jobs';
import { fetchInvoices } from '../lib/invoices';
import { fetchJobStatuses } from '../lib/jobStatuses';
import { fetchVehicles } from '../lib/vehicles';

export default function OfficeDashboard() {
  const [quotes, setQuotes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [todayJobs, setTodayJobs] = useState([]);

  useEffect(() => {
    Promise.all([
      fetchQuotes(),
      fetchJobs(),
      fetchInvoices(),
      fetchJobStatuses(),
      fetchVehicles(),
    ])
      .then(([q, j, i, s, v]) => {
        setQuotes(q);
        setJobs(j);
        setInvoices(i);
        setStatuses(s);
        setVehicles(v);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const load = () => {
      fetchJobsForDate(dateStr)
        .then(setTodayJobs)
        .catch(() => setTodayJobs([]));
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const openQuotes = useMemo(
    () =>
      quotes.filter(
        (q) => !['job-card', 'completed', 'invoiced'].includes(q.status)
      ),
    [quotes]
  );

  const unpaidInvoices = useMemo(
    () =>
      invoices.filter(
        (inv) => ['unpaid', 'issued'].includes((inv.status || '').toLowerCase())
      ),
    [invoices]
  );

  const jobStatusCounts = useMemo(() => {
    const counts = {};
    statuses.forEach((s) => {
      counts[s.name] = 0;
    });
    jobs.forEach((j) => {
      if (counts[j.status] !== undefined) counts[j.status] += 1;
    });
    return counts;
  }, [jobs, statuses]);

  const upcomingVehicles = useMemo(() => {
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + 30);
    return vehicles.filter((v) => {
      const dueDates = [];
      if (v.service_date) {
        const d = new Date(v.service_date);
        d.setFullYear(d.getFullYear() + 1);
        dueDates.push(d);
      }
      if (v.itv_date) {
        const d = new Date(v.itv_date);
        d.setFullYear(d.getFullYear() + 1);
        dueDates.push(d);
      }
      return dueDates.some((d) => d >= now && d <= soon);
    });
  }, [vehicles]);

  const jobsByStatus = useMemo(() => {
    const byId = {};
    vehicles.forEach((v) => {
      byId[v.id] = v.licence_plate;
    });
    const map = {};
    statuses.forEach((s) => {
      map[s.name] = [];
    });
    jobs.forEach((j) => {
      if (map[j.status]) {
        map[j.status].push({
          ...j,
          licence_plate: byId[j.vehicle_id] || '',
        });
      }
    });
    for (const key in map) {
      map[key].sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(a.created_at) - new Date(b.created_at);
        }
        return a.id - b.id;
      });
    }
    return map;
  }, [jobs, vehicles, statuses]);

  const mid = Math.ceil(statuses.length / 2);
  const firstHalf = statuses.slice(0, mid);
  const secondHalf = statuses.slice(mid);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/office/quotations/new" className="button px-8 text-lg">
          Create Quote
        </Link>
        <Link href="/office/jobs/new" className="button px-8 text-lg">
          New Job
        </Link>
        <Link href="/office/invoices/new" className="button px-8 text-lg">
          Create Invoice
        </Link>
        <Link
          href="/office/invoices?status=unpaid"
          className="button px-8 text-lg"
        >
          Pay Invoice
        </Link>
      </div>

      <div className="bg-white text-black rounded-2xl p-4 shadow mt-6">
        <h2 className="text-lg font-semibold mb-4">
          Jobs - showing oldest jobs
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {statuses.map((s) => (
            <div key={s.id} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 shadow-md border border-blue-200">
              <div className="text-xs font-medium text-blue-800 capitalize mb-1">
                {s.name}
              </div>
              <Link
                href={`/office/job-management?status=${encodeURIComponent(s.name)}`}
                className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                {jobStatusCounts[s.name] || 0}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white text-black rounded-2xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Open Quotes</h2>
          <p className="text-4xl font-bold text-blue-600">
            <Link href="/office/quotations">{openQuotes.length}</Link>
          </p>
        </div>
        <div className="bg-white text-black rounded-2xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Unpaid Invoices</h2>
          <p className="text-4xl font-bold text-blue-600">
            <Link href="/office/invoices?status=unpaid">
              {unpaidInvoices.length}
            </Link>
          </p>
        </div>
        <div className="bg-white text-black rounded-2xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">
            Upcoming ITV &amp; Services
          </h2>
          {upcomingVehicles.length === 0 ? (
            <p>No vehicles due in next 30 days.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {upcomingVehicles.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/office/vehicles/view/${v.id}`}
                    className="underline"
                  >
                    {v.licence_plate} - {v.customer_name || 'N/A'}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white text-black rounded-2xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Today&apos;s Jobs</h2>
          {todayJobs.length === 0 ? (
            <p>No jobs today.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {todayJobs.map((j) => (
                <li key={j.id}>
                  <Link
                    href={`/office/jobs/${j.id}`}
                    className="underline"
                  >
                    {j.licence_plate} - {j.engineers || 'Unassigned'} -{' '}
                    {j.status}
                  </Link>
                  <div className="text-xs">
                    {j.scheduled_start
                      ? new Date(j.scheduled_start).toLocaleString()
                      : 'N/A'}{' '}
                    -{' '}
                    {j.scheduled_end
                      ? new Date(j.scheduled_end).toLocaleString()
                      : 'N/A'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
