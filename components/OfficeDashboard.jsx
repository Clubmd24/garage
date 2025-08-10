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
import { 
  StatsWidget, 
  JobStatusWidget, 
  RevenueWidget, 
  QuickActionsWidget,
  VehicleOverviewWidget,
  TeamStatusWidget 
} from './ui/EnhancedDashboardWidgets';
import { ProgressBar, CircularProgress } from './ui/DataVisualization';
import { showToast } from './ui/NotificationSystem';

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
        
        // Show welcome toast
        showToast({
          type: 'success',
          title: 'Dashboard Loaded',
          message: 'Welcome to your command center!',
          duration: 3000
        });
      })
      .catch(() => {
        setLoading(false);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load dashboard data',
          duration: 5000
        });
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

  // Calculate revenue metrics
  const revenueMetrics = useMemo(() => {
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const monthlyRevenue = invoices
      .filter(inv => {
        if (inv.status !== 'paid' || !inv.paid_date) return false;
        const paidDate = new Date(inv.paid_date);
        const now = new Date();
        return paidDate.getMonth() === now.getMonth() && 
               paidDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const pendingRevenue = unpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    return { totalRevenue, monthlyRevenue, pendingRevenue };
  }, [invoices, unpaidInvoices]);

  // Calculate completion rate
  const completionRate = useMemo(() => {
    if (jobs.length === 0) return 0;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;
    return Math.round((completedJobs / jobs.length) * 100);
  }, [jobs]);

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

      {/* Enhanced Stats Overview with New Widgets */}
      <div className="dashboard-grid">
        <StatsWidget
          title="Open Quotes"
          value={openQuotes.length}
          change={`${openQuotes.length > 0 ? 'Requires attention' : 'All caught up'}`}
          changeType={openQuotes.length > 0 ? 'warning' : 'positive'}
          icon={({ className }) => (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          trend={openQuotes.length > 0 ? 'up' : 'down'}
        />

        <StatsWidget
          title="Unpaid Invoices"
          value={unpaidInvoices.length}
          change={`£${revenueMetrics.pendingRevenue.toLocaleString()}`}
          changeType={unpaidInvoices.length > 0 ? 'warning' : 'positive'}
          icon={({ className }) => (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          )}
          trend={unpaidInvoices.length > 0 ? 'up' : 'down'}
        />

        <StatsWidget
          title="Today's Jobs"
          value={todayJobs.length}
          change={`${todayJobs.length > 0 ? 'Active' : 'No jobs'}`}
          changeType={todayJobs.length > 0 ? 'info' : 'neutral'}
          icon={({ className }) => (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
          trend={todayJobs.length > 0 ? 'up' : 'down'}
        />

        <StatsWidget
          title="Upcoming Services"
          value={upcomingVehicles.length}
          change={`Due in 30 days`}
          changeType={upcomingVehicles.length > 0 ? 'warning' : 'positive'}
          icon={({ className }) => (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          trend={upcomingVehicles.length > 0 ? 'up' : 'down'}
        />
      </div>

      {/* Enhanced Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueWidget 
          revenue={revenueMetrics.monthlyRevenue}
          target={revenueMetrics.totalRevenue * 0.1} // 10% of total as monthly target
          loading={loading}
        />
        
        <Card className="admin-card">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-secondary">Job Completion Rate</span>
                <span className="text-sm text-text-primary">{completionRate}%</span>
              </div>
              <ProgressBar 
                value={completionRate} 
                max={100} 
                variant="success" 
                size="md"
                showLabel={false}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <CircularProgress 
                  value={revenueMetrics.monthlyRevenue} 
                  max={revenueMetrics.totalRevenue * 0.15}
                  variant="primary"
                  size="md"
                  showLabel={false}
                />
                <p className="text-sm text-text-secondary mt-2">Monthly Goal</p>
              </div>
              <div className="text-center">
                <CircularProgress 
                  value={todayJobs.length} 
                  max={20}
                  variant="info"
                  size="md"
                  showLabel={false}
                />
                <p className="text-sm text-text-secondary mt-2">Daily Capacity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Job Status Overview */}
      <JobStatusWidget jobs={jobs} statuses={statuses} loading={loading} />

      {/* Enhanced Vehicle Overview */}
      <VehicleOverviewWidget vehicles={vehicles} loading={loading} />

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
      <QuickActionsWidget 
        actions={[
          {
            title: 'New Quote',
            icon: 'plus',
            href: '/office/quotations/new',
            variant: 'primary'
          },
          {
            title: 'New Job',
            icon: 'briefcase',
            href: '/office/jobs/new',
            variant: 'secondary'
          },
          {
            title: 'New Invoice',
            icon: 'file-text',
            href: '/office/invoices/new',
            variant: 'success'
          },
          {
            title: 'New Client',
            icon: 'user-plus',
            href: '/office/clients/new',
            variant: 'accent'
          }
        ]}
        loading={loading}
      />
    </div>
  );
}
