import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('fetchDashboardData aggregates responses', async () => {
  const jobs = [{ id: 1, scheduled_start: '2025-07-24T08:00:00Z' }];
  const holidays = [{ id: 2, start_date: '2025-01-01', end_date: '2025-01-05', status: 'approved' }];
  const attendance = [{ id: 3, employee_id: 5, clock_in: '2025-07-23 08:00', clock_out: '2025-07-23 17:00' }];
  const shifts = [{ id: 4, employee_id: 5, start_time: '2025-07-25T09:00:00Z', end_time: '2025-07-25T17:00:00Z' }];
  const user = { id: 5, username: 'bob', email: 'b@b.com' };
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => jobs })
    .mockResolvedValueOnce({ ok: true, json: async () => holidays })
    .mockResolvedValueOnce({ ok: true, json: async () => attendance })
    .mockResolvedValueOnce({ ok: true, json: async () => shifts })
    .mockResolvedValueOnce({ ok: true, json: async () => user });

  const { fetchDashboardData } = await import('../lib/engineerDashboard.js');
  const result = await fetchDashboardData();

  expect(fetch).toHaveBeenNthCalledWith(1, '/api/engineer/jobs', { credentials: 'include' });
  expect(fetch).toHaveBeenNthCalledWith(2, '/api/engineer/holiday-requests', { credentials: 'include' });
  expect(fetch).toHaveBeenNthCalledWith(3, '/api/hr/attendance');
  expect(fetch).toHaveBeenNthCalledWith(4, '/api/hr/shifts');
  expect(fetch).toHaveBeenNthCalledWith(5, '/api/auth/me', { credentials: 'include' });
  expect(result.jobs).toEqual(jobs);
  expect(result.holidays).toEqual(holidays);
  expect(result.attendance).toEqual(attendance);
  expect(result.shifts).toEqual(shifts);
  expect(result.user).toEqual(user);
  expect(result.remainingDays).toBe(15);
});

test('fetchDashboardData throws on failure', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false });
  const { fetchDashboardData } = await import('../lib/engineerDashboard.js');
  await expect(fetchDashboardData()).rejects.toThrow('Failed');
});
