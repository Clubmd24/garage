import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { fetchQuotes } from '../lib/quotes';
import { fetchJobs, fetchJobsForDate } from '../lib/jobs';
import { fetchInvoices } from '../lib/invoices';
import { fetchJobStatuses } from '../lib/jobStatuses';
import { fetchVehicles } from '../lib/vehicles';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/Button';
import { Badge } from './ui/StatusIndicators';

export default function OfficeDashboard() {
  const [quotes, setQuotes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [todayJobs, setTodayJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
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
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
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
      map[s.name] = jobs
        .filter((j) => j.status === s.name)
        .map((j) => ({
          ...j,
          licence_plate: byId[j.vehicle_id] || 'Unknown',
        }));
    });
    return map;
  }, [jobs, statuses, vehicles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="text-center mb-12">
        <h1 className="text-h1 text-text-primary mb-4">Office Dashboard</h1>
        <p className="text-text-secondary text-xl max-w-2xl mx-auto">
          Welcome to your command center. Monitor operations, track performance, and manage your garage efficiently.
        </p>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="dashboard-grid">
        <Card variant="stats" className="admin-card">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-success">
              {openQuotes.length}
            </CardTitle>
            <CardDescription>Open Quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Requires attention</span>
              <Link href="/office/quotations">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card variant="warning" className="admin-card">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-warning">
              {unpaidInvoices.length}
            </CardTitle>
            <CardDescription>Unpaid Invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Outstanding payments</span>
              <Link href="/office/invoices">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card variant="info" className="admin-card">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-info">
              {todayJobs.length}
            </CardTitle>
            <CardDescription>Today's Jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Scheduled for today</span>
              <Link href="/office/jobs">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card variant="danger" className="admin-card">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-error">
              {upcomingVehicles.length}
            </CardTitle>
            <CardDescription>Upcoming Services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Due in 30 days</span>
              <Link href="/office/vehicles">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Job Status Overview */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle>Job Status Overview</CardTitle>
          <CardDescription>Current distribution of jobs across all statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {statuses.map((status) => (
              <div key={status.id} className="text-center p-4 bg-surface-secondary rounded-lg border border-border-primary/50">
                <div className="text-2xl font-bold text-text-primary mb-2">
                  {jobStatusCounts[status.name] || 0}
                </div>
                <div className="text-sm text-text-secondary capitalize">
                  {status.name.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Today's Jobs */}
      <Card className="admin-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Jobs</CardTitle>
              <CardDescription>Jobs scheduled for {new Date().toLocaleDateString()}</CardDescription>
            </div>
            <Badge variant="primary" className="text-sm">
              {todayJobs.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {todayJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No jobs scheduled for today</h3>
              <p className="text-text-secondary">Enjoy a productive day or check upcoming assignments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg border border-border-primary/50 hover:border-border-accent transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <div>
                      <div className="font-medium text-text-primary">Job #{job.id}</div>
                      <div className="text-sm text-text-secondary">
                        {job.vehicle_id ? `Vehicle: ${job.vehicle_id}` : 'No vehicle assigned'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="info" className="mb-2">
                      {job.status || 'Pending'}
                    </Badge>
                    <div className="text-xs text-text-muted">Priority: High</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/office/quotations/new">
              <Button variant="primary" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Quote</span>
              </Button>
            </Link>
            
            <Link href="/office/jobs/new">
              <Button variant="secondary" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>New Job</span>
              </Button>
            </Link>
            
            <Link href="/office/invoices/new">
              <Button variant="success" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>New Invoice</span>
              </Button>
            </Link>
            
            <Link href="/office/clients/new">
              <Button variant="accent" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>New Client</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
