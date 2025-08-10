import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/StatusIndicators';
import { fetchDashboardData } from '../../lib/engineerDashboard.js';

export default function EngineerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData()
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
      <div className="page-transition p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <h1 className="text-h1 text-text-primary mb-4">Engineer Dashboard</h1>
          <p className="text-text-secondary text-xl max-w-2xl mx-auto">
            Welcome back, {data.user.username}! Here's your daily overview and upcoming tasks.
          </p>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="dashboard-grid">
          <Card variant="stats" className="job-card-mechanic">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-success">
                {todaysJobs.length}
              </CardTitle>
              <CardDescription>Today's Jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Active assignments</span>
                <Badge variant="success" className="text-xs">Active</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="warning" className="job-card-mechanic">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-warning">
                {data.remainingDays}
              </CardTitle>
              <CardDescription>Holiday Days Left</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Plan your time off</span>
                <Badge variant="warning" className="text-xs">Plan</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="info" className="job-card-mechanic">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-info">
                {upcomingShifts.length}
              </CardTitle>
              <CardDescription>Upcoming Shifts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Next 5 shifts</span>
                <Badge variant="info" className="text-xs">Scheduled</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="success" className="job-card-mechanic">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-success">
                {myAttendance.length}
              </CardTitle>
              <CardDescription>Attendance Records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">This month</span>
                <Badge variant="success" className="text-xs">Good</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Today's Jobs */}
        <Card className="job-card-mechanic">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Jobs</CardTitle>
                <CardDescription>Jobs scheduled for {new Date().toLocaleDateString()}</CardDescription>
              </div>
              <Badge variant="primary" className="text-sm">
                {todaysJobs.length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {todaysJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">No jobs scheduled for today</h3>
                <p className="text-text-secondary">Enjoy your day off or check upcoming assignments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysJobs.map(j => (
                  <div key={j.id} className="flex items-center justify-between p-4 bg-surface-secondary rounded-xl border border-border-primary/50 hover:border-border-accent transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <div>
                        <div className="font-medium text-text-primary">Job #{j.id}</div>
                        <div className="text-sm text-text-secondary">Scheduled for today</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="info" className="mb-2">
                        {j.status || 'Pending'}
                      </Badge>
                      <div className="text-xs text-text-muted">Priority: High</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Upcoming Shifts */}
        <Card className="job-card-mechanic">
          <CardHeader>
            <CardTitle>Upcoming Shifts</CardTitle>
            <CardDescription>Your next 5 scheduled shifts</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingShifts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary">No upcoming shifts scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingShifts.map((shift, index) => (
                  <div key={shift.id} className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg border border-border-primary/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">
                          {new Date(shift.start_time).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {new Date(shift.start_time).toLocaleTimeString()} - {new Date(shift.end_time).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant="info">Scheduled</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Holiday Requests */}
        <Card className="job-card-mechanic">
          <CardHeader>
            <CardTitle>Holiday Requests</CardTitle>
            <CardDescription>Manage your time off requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
                <div>
                  <div className="font-medium text-text-primary">Remaining Days</div>
                  <div className="text-sm text-text-secondary">Plan your time off wisely</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-warning">{data.remainingDays}</div>
                  <div className="text-xs text-text-muted">days left</div>
                </div>
              </div>
              
              {upcomingRequests.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-text-primary">Upcoming Requests</h4>
                  {upcomingRequests.slice(0, 3).map(request => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-surface-tertiary rounded-lg">
                      <div>
                        <div className="font-medium text-text-primary">
                          {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-text-secondary">{request.reason || 'No reason provided'}</div>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="pt-4">
                <Button variant="primary" className="w-full">
                  Request Holiday
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Actions */}
        <Card className="job-card-mechanic">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="primary" className="h-16 flex flex-col items-center justify-center space-y-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Clock In/Out</span>
              </Button>
              
              <Button variant="secondary" className="h-16 flex flex-col items-center justify-center space-y-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm">View Jobs</span>
              </Button>
              
              <Button variant="accent" className="h-16 flex flex-col items-center justify-center space-y-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Holiday</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
