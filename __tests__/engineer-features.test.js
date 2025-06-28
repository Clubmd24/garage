import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('engineer jobs returns active jobs', async () => {
  const jobs = [{ id: 1 }];
  const listMock = jest.fn().mockResolvedValue(jobs);
  jest.unstable_mockModule('../services/jobsService.js', () => ({
    listActiveJobsForEngineer: listMock,
  }));
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: jest.fn().mockResolvedValueOnce([[{ name: 'engineer' }]]) },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 1 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/jobs/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(listMock).toHaveBeenCalledWith(1);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(jobs);
});

test('time entries clock in creates entry', async () => {
  const entry = { id: 2 };
  const clockInMock = jest.fn().mockResolvedValue(entry);
  jest.unstable_mockModule('../services/timeEntriesService.js', () => ({
    clockIn: clockInMock,
    clockOut: jest.fn(),
  }));
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: jest.fn().mockResolvedValue([[{ name: 'engineer' }]]) },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 2 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/time-entries/index.js');
  const req = { method: 'POST', query: { action: 'clock-in' }, body: { job_id: 5 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(clockInMock).toHaveBeenCalledWith(5, 2);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(entry);
});

test('holiday requests list own entries', async () => {
  const rows = [{ id: 3 }];
  const listMock = jest.fn().mockResolvedValue(rows);
  jest.unstable_mockModule('../services/holidayRequestsService.js', () => ({
    listRequests: listMock,
    submitRequest: jest.fn(),
  }));
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: jest.fn().mockResolvedValue([[{ name: 'engineer' }]]) },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 3 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/holiday-requests/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(listMock).toHaveBeenCalledWith(3);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(rows);
});

