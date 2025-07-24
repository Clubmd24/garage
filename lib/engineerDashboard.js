export async function fetchDashboardData() {
  const [jobsRes, holidaysRes, attendanceRes, shiftsRes, userRes] = await Promise.all([
    fetch('/api/engineer/jobs', { credentials: 'include' }),
    fetch('/api/engineer/holiday-requests', { credentials: 'include' }),
    fetch('/api/hr/attendance'),
    fetch('/api/hr/shifts'),
    fetch('/api/auth/me', { credentials: 'include' }),
  ]);

  if (![jobsRes, holidaysRes, attendanceRes, shiftsRes, userRes].every(r => r.ok)) {
    throw new Error('Failed to load dashboard data');
  }

  const [jobs, holidays, attendance, shifts, user] = await Promise.all([
    jobsRes.json(),
    holidaysRes.json(),
    attendanceRes.json(),
    shiftsRes.json(),
    userRes.json(),
  ]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const used = holidays
    .filter(h => h.status === 'approved' && new Date(h.start_date).getFullYear() === currentYear)
    .reduce((sum, h) => {
      const start = new Date(h.start_date);
      const end = new Date(h.end_date);
      return sum + Math.round((end - start) / 86400000) + 1;
    }, 0);
  const remainingDays = 20 - used;

  return { jobs, holidays, attendance, shifts, user, remainingDays };
}
