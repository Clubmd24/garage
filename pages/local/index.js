import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/StatusIndicators';
import { fetchLocalDashboardData } from '../../lib/clients';

export default function LocalClientDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLocalDashboardData()
      .then(setData)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary text-lg">Loading dashboard...</p>
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
  const recentJobs = data.jobs.slice(0, 5);
  const pendingQuotes = data.quotes.filter(q => q.status === 'pending');
  const overdueInvoices = data.invoices.filter(i => i.due_date && new Date(i.due_date) < new Date() && i.status !== 'paid');
  const upcomingServices = data.vehicles.filter(v => v.next_service_date && new Date(v.next_service_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  return (
    <Layout>
      <div className="page-transition p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <h1 className="text-h1 text-text-primary mb-4">Welcome Back!</h1>
          <p className="text-text-secondary text-xl max-w-2xl mx-auto">
            Hello {data.client.first_name}! Here's your personal garage overview and vehicle management center.
          </p>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="dashboard-grid">
          <Card variant="stats" className="job-card-mechanic">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-success">
                {activeVehicles.length}
              </CardTitle>
              <CardDescription>Your Vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Registered vehicles</span>
                <Badge variant="success" className="text-xs">Active</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="warning" className="job-card-mechanic">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-warning">
                {upcomingServices.length}
              </CardTitle>
              <CardDescription>Services Due</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Next 30 days</span>
                <Badge variant="warning" className="text-xs">Schedule</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="info" className="job-card-mechanic">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-info">
                {recentJobs.length}
              </CardTitle>
              <CardDescription>Recent Jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Last 5 jobs</span>
                <Badge variant="info" className="text-xs">Active</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="accent" className="job-card-mechanic">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-accent">
                {pendingQuotes.length}
              </CardTitle>
              <CardDescription>Pending Quotes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Awaiting approval</span>
                <Badge variant="accent" className="text-xs">Review</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Vehicle Overview */}
        <Card className="job-card-mechanic">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Vehicles</CardTitle>
                <CardDescription>Manage and monitor your registered vehicles</CardDescription>
              </div>
              <Badge variant="primary" className="text-sm">
                {data.vehicles.length} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {data.vehicles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">No vehicles registered</h3>
                <p className="text-text-secondary">Add your first vehicle to get started</p>
                <Button variant="primary" className="mt-4">
                  Add Vehicle
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.vehicles.map(vehicle => (
                  <div key={vehicle.id} className="p-4 bg-surface-secondary rounded-xl border border-border-primary/50 hover:border-border-accent transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-text-primary">{vehicle.registration}</h4>
                      <Badge variant={vehicle.status === 'active' ? 'success' : 'warning'}>
                        {vehicle.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Make:</span>
                        <span className="text-text-primary">{vehicle.make}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Model:</span>
                        <span className="text-text-primary">{vehicle.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Year:</span>
                        <span className="text-text-primary">{vehicle.year}</span>
                      </div>
                      {vehicle.next_service_date && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Next Service:</span>
                          <span className={`text-sm ${new Date(vehicle.next_service_date) <= new Date() ? 'text-error' : 'text-text-primary'}`}>
                            {new Date(vehicle.next_service_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border-primary/30">
                      <Button variant="secondary" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Recent Jobs */}
        <Card className="job-card-mechanic">
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Latest service history and job updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">No recent jobs</h3>
                <p className="text-text-secondary">Your service history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-surface-secondary rounded-xl border border-border-primary/50 hover:border-border-accent transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <div>
                        <div className="font-medium text-text-primary">Job #{job.id}</div>
                        <div className="text-sm text-text-secondary">
                          {job.vehicle_registration} • {job.description || 'No description'}
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
          </CardContent>
        </Card>

        {/* Enhanced Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Quotes */}
          <Card className="job-card-mechanic">
            <CardHeader>
              <CardTitle>Pending Quotes</CardTitle>
              <CardDescription>Quotes awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingQuotes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary">No pending quotes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingQuotes.slice(0, 3).map(quote => (
                    <div key={quote.id} className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                      <div>
                        <div className="font-medium text-text-primary">Quote #{quote.id}</div>
                        <div className="text-sm text-text-secondary">
                          {quote.vehicle_registration} • £{quote.total_amount || '0.00'}
                        </div>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {pendingQuotes.length > 3 && (
                <div className="text-center pt-4">
                  <Button variant="secondary" className="w-full">
                    View All ({pendingQuotes.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overdue Invoices */}
          <Card className="job-card-mechanic">
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
              <CardDescription>Invoices requiring payment</CardDescription>
            </CardHeader>
            <CardContent>
              {overdueInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">All caught up!</h3>
                  <p className="text-text-secondary">No outstanding invoices</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {overdueInvoices.slice(0, 3).map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                      <div>
                        <div className="font-medium text-text-primary">Invoice #{invoice.id}</div>
                        <div className="text-sm text-text-secondary">
                          Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No date'} • £{invoice.total_amount || '0.00'}
                        </div>
                      </div>
                      <Badge variant="error">Overdue</Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {overdueInvoices.length > 3 && (
                <div className="text-center pt-4">
                  <Button variant="error" className="w-full">
                    View All ({overdueInvoices.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions */}
        <Card className="job-card-mechanic">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="primary" className="h-16 flex flex-col items-center justify-center space-y-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm">Book Service</span>
              </Button>
              
              <Button variant="secondary" className="h-16 flex flex-col items-center justify-center space-y-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Schedule</span>
              </Button>
              
              <Button variant="accent" className="h-16 flex flex-col items-center justify-center space-y-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm">History</span>
              </Button>
              
              <Button variant="info" className="h-16 flex flex-col items-center justify-center space-y-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
