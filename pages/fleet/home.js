import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/StatusIndicators';
import { fetchFleetDashboardData } from '../../lib/fleets';
import { 
  StatsWidget, 
  VehicleOverviewWidget, 
  QuickActionsWidget,
  TeamStatusWidget 
} from '../../components/ui/EnhancedDashboardWidgets';
import { ProgressBar, CircularProgress } from '../../components/ui/DataVisualization';
import { showToast } from '../../components/ui/NotificationSystem';

export default function FleetDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchFleetDashboardData()
      .then(setData)
      .then(() => {
        showToast({
          type: 'success',
          title: 'Dashboard Loaded',
          message: 'Welcome to your fleet management center!',
          duration: 3000
        });
      })
      .catch(() => {
        setError('Failed to load dashboard');
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load dashboard data',
          duration: 5000
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary text-lg">Loading fleet dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
          <div className="text-center">
            <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Failed to load dashboard</h3>
            <p className="text-text-secondary">{error}</p>
            <Button 
              variant="primary" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!data) return null;

  const activeVehicles = data.vehicles.filter(v => v.status === 'active');
  const maintenanceDue = data.vehicles.filter(v => v.next_service_date && new Date(v.next_service_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const recentJobs = data.jobs.slice(0, 5);
  const pendingQuotes = data.quotes.filter(q => q.status === 'pending');
  const overdueInvoices = data.invoices.filter(i => i.due_date && new Date(i.due_date) < new Date() && i.status !== 'paid');

  // Calculate fleet performance metrics
  const fleetUtilization = data.vehicles.length > 0 ? Math.round((activeVehicles.length / data.vehicles.length) * 100) : 0;
  const maintenanceEfficiency = data.vehicles.length > 0 ? Math.round(((data.vehicles.length - maintenanceDue.length) / data.vehicles.length) * 100) : 0;
  
  // Calculate financial metrics
  const totalRevenue = data.invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);
  
  const pendingRevenue = pendingQuotes.reduce((sum, q) => sum + (q.total || 0), 0);
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  return (
    <Layout>
      <div className="page-transition p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <h1 className="text-h1 text-text-primary mb-4">Fleet Dashboard</h1>
          <p className="text-text-secondary text-xl max-w-2xl mx-auto">
            Welcome to your fleet management center. Monitor vehicles, track jobs, and manage operations efficiently.
          </p>
        </div>

        {/* Enhanced Stats Overview with New Widgets */}
        <div className="dashboard-grid">
          <StatsWidget
            title="Active Vehicles"
            value={activeVehicles.length}
            change={`${fleetUtilization}% utilization`}
            changeType={fleetUtilization > 80 ? 'success' : fleetUtilization > 60 ? 'warning' : 'error'}
            icon={({ className }) => (
              <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            trend={fleetUtilization > 80 ? 'up' : 'down'}
          />
          
          <StatsWidget
            title="Maintenance Due"
            value={maintenanceDue.length}
            change={`${maintenanceEfficiency}% efficiency`}
            changeType={maintenanceDue.length > 0 ? 'warning' : 'success'}
            icon={({ className }) => (
              <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            trend={maintenanceDue.length > 0 ? 'up' : 'down'}
          />
          
          <StatsWidget
            title="Recent Jobs"
            value={recentJobs.length}
            change="Last 5 jobs"
            changeType="info"
            icon={({ className }) => (
              <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
            trend="up"
          />
          
          <StatsWidget
            title="Pending Quotes"
            value={pendingQuotes.length}
            change={`£${pendingRevenue.toLocaleString()}`}
            changeType={pendingQuotes.length > 0 ? 'warning' : 'success'}
            icon={({ className }) => (
              <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            trend={pendingQuotes.length > 0 ? 'up' : 'down'}
          />
        </div>

        {/* Enhanced Fleet Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="job-card-mechanic">
            <CardHeader>
              <CardTitle>Fleet Performance</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-text-secondary">Fleet Utilization</span>
                  <span className="text-sm text-text-primary">{fleetUtilization}%</span>
                </div>
                <ProgressBar 
                  value={fleetUtilization} 
                  max={100} 
                  variant={fleetUtilization > 80 ? 'success' : fleetUtilization > 60 ? 'warning' : 'error'} 
                  size="md"
                  showLabel={false}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-text-secondary">Maintenance Efficiency</span>
                  <span className="text-sm text-text-primary">{maintenanceEfficiency}%</span>
                </div>
                <ProgressBar 
                  value={maintenanceEfficiency} 
                  max={100} 
                  variant={maintenanceEfficiency > 80 ? 'success' : maintenanceEfficiency > 60 ? 'warning' : 'error'} 
                  size="md"
                  showLabel={false}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="job-card-mechanic">
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Revenue and outstanding amounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-surface-secondary rounded-lg">
                  <div className="text-2xl font-bold text-success mb-1">£{totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-text-secondary">Total Revenue</div>
                </div>
                <div className="text-center p-4 bg-surface-secondary rounded-lg">
                  <div className="text-2xl font-bold text-warning mb-1">£{overdueAmount.toLocaleString()}</div>
                  <div className="text-sm text-text-secondary">Overdue</div>
                </div>
              </div>
              
              <div className="text-center">
                <CircularProgress 
                  value={pendingRevenue} 
                  max={totalRevenue * 0.3}
                  variant="accent"
                  size="md"
                  showLabel={false}
                />
                <p className="text-sm text-text-secondary mt-2">Pending Revenue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Vehicle Overview */}
        <VehicleOverviewWidget vehicles={data.vehicles} loading={loading} />

        {/* Enhanced Recent Jobs */}
        <Card className="job-card-mechanic">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>Latest job activities and status</CardDescription>
              </div>
              <Badge variant="primary" className="text-sm">
                {data.jobs.length} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">No recent jobs</h3>
                <p className="text-text-secondary">Jobs will appear here as they are created</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
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
                      <div className="text-xs text-text-muted">
                        {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {data.jobs.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="secondary">
                  View All Jobs ({data.jobs.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Quick Actions */}
        <QuickActionsWidget 
          actions={[
            {
              title: 'Add Vehicle',
              icon: 'car',
              href: '/fleet/vehicles/new',
              variant: 'primary'
            },
            {
              title: 'New Job',
              icon: 'briefcase',
              href: '/fleet/jobs/new',
              variant: 'secondary'
            },
            {
              title: 'Request Quote',
              icon: 'file-text',
              href: '/fleet/quotes/new',
              variant: 'success'
            },
            {
              title: 'View Invoices',
              icon: 'receipt',
              href: '/fleet/invoices',
              variant: 'accent'
            }
          ]}
          loading={loading}
        />
      </div>
    </Layout>
  );
}
