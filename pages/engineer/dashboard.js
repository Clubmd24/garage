import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/StatusIndicators';
import { fetchDashboardData } from '../../lib/engineerDashboard.js';
import { 
  StatsWidget, 
  JobStatusWidget, 
  QuickActionsWidget,
  TeamStatusWidget 
} from '../../components/ui/EnhancedDashboardWidgets';
import { ProgressBar, CircularProgress } from '../../components/ui/DataVisualization';
import { showToast } from '../../components/ui/NotificationSystem';

export default function EngineerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData()
      .then(setData)
      .then(() => {
        showToast({
          type: 'success',
          title: 'Dashboard Loaded',
          message: 'Welcome back to your workspace!',
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

  // Calculate performance metrics
  const completedJobs = data.jobs.filter(j => j.status === 'completed').length;
  const totalJobs = data.jobs.length;
  const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
  
  const thisMonthAttendance = myAttendance.filter(a => {
    const attendanceDate = new Date(a.date);
    const now = new Date();
    return attendanceDate.getMonth() === now.getMonth() && 
           attendanceDate.getFullYear() === now.getFullYear();
  }).length;
  
  const workingDaysThisMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const attendanceRate = Math.round((thisMonthAttendance / workingDaysThisMonth) * 100);

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

        {/* Enhanced Stats Overview with New Widgets */}
        <div className="dashboard-grid">
          <StatsWidget
            title="Today's Jobs"
            value={todaysJobs.length}
            change={`${todaysJobs.length > 0 ? 'Active' : 'No jobs'}`}
            changeType={todaysJobs.length > 0 ? 'info' : 'neutral'}
            icon={({ className }) => (
              <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
            trend={todaysJobs.length > 0 ? 'up' : 'down'}
          />
          
          <StatsWidget
            title="Holiday Days Left"
            value={data.remainingDays}
            change="Plan your time off"
            changeType="warning"
            icon={({ className }) => (
              <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            trend="down"
          />
          
          <StatsWidget
            title="Upcoming Shifts"
            value={upcomingShifts.length}
            change="Next 5 shifts"
            changeType="info"
            icon={({ className }) => (
              <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            trend="up"
          />
          
          <StatsWidget
            title="Attendance Records"
            value={myAttendance.length}
            change="This month"
            changeType="success"
            icon={({ className }) => (
              <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            trend="up"
          />
        </div>

        {/* Enhanced Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="job-card-mechanic">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Your work performance indicators</CardDescription>
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
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-text-secondary">Monthly Attendance</span>
                  <span className="text-sm text-text-primary">{attendanceRate}%</span>
                </div>
                <ProgressBar 
                  value={attendanceRate} 
                  max={100} 
                  variant="primary" 
                  size="md"
                  showLabel={false}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="job-card-mechanic">
            <CardHeader>
              <CardTitle>Work Summary</CardTitle>
              <CardDescription>This month's overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-surface-secondary rounded-lg">
                  <div className="text-2xl font-bold text-success mb-1">{completedJobs}</div>
                  <div className="text-sm text-text-secondary">Jobs Completed</div>
                </div>
                <div className="text-center p-4 bg-surface-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">{thisMonthAttendance}</div>
                  <div className="text-sm text-text-secondary">Days Worked</div>
                </div>
              </div>
              
              <div className="text-center">
                <CircularProgress 
                  value={completionRate} 
                  max={100}
                  variant="success"
                  size="md"
                  showLabel={false}
                />
                <p className="text-sm text-text-secondary mt-2">Overall Performance</p>
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
        <QuickActionsWidget 
          actions={[
            {
              title: 'Clock In/Out',
              icon: 'clock',
              onClick: () => showToast({
                type: 'info',
                title: 'Clock In/Out',
                message: 'Time tracking feature coming soon!',
                duration: 3000
              }),
              variant: 'primary'
            },
            {
              title: 'View Jobs',
              icon: 'briefcase',
              href: '/engineer/jobs',
              variant: 'secondary'
            },
            {
              title: 'Holiday',
              icon: 'calendar',
              onClick: () => showToast({
                type: 'info',
                title: 'Holiday Request',
                message: 'Holiday request feature coming soon!',
                duration: 3000
              }),
              variant: 'accent'
            }
          ]}
          loading={loading}
        />
      </div>
    </Layout>
  );
}
