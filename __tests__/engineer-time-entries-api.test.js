import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

// clock-in success

test('time entries clock in creates entry', async () => {
  const entry = { id: 1 };
  const clockInMock = jest.fn().mockResolvedValue(entry);
  jest.unstable_mockModule('../services/timeEntriesService.js', () => ({
    clockIn: clockInMock,
    clockOut: jest.fn(),
  }));
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'engineer' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 1 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/time-entries/index.js');
  const req = { method: 'POST', query: { action: 'clock-in' }, body: { job_id: 5 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(clockInMock).toHaveBeenCalledWith(5, 1);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(entry);
});

// clock-out success

test('time entries clock out updates entry', async () => {
  const entry = { id: 2 };
  const clockOutMock = jest.fn().mockResolvedValue(entry);
  jest.unstable_mockModule('../services/timeEntriesService.js', () => ({
    clockIn: jest.fn(),
    clockOut: clockOutMock,
  }));
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'engineer' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 2 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/time-entries/index.js');
  const req = { method: 'POST', query: { action: 'clock-out' }, body: { entry_id: 7 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(clockOutMock).toHaveBeenCalledWith(7);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(entry);
});

// authentication and role checks

test('time entries returns 401 when unauthenticated', async () => {
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: jest.fn() },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => null,
  }));
  const { default: handler } = await import('../pages/api/engineer/time-entries/index.js');
  const req = { method: 'POST', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
});

test('time entries returns 403 for non-engineer role', async () => {
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'viewer' }]]);
  jest.unstable_mockModule('../services/timeEntriesService.js', () => ({
    clockIn: jest.fn(),
    clockOut: jest.fn(),
  }));
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 3 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/time-entries/index.js');
  const req = { method: 'POST', query: { action: 'clock-in' }, body: { job_id: 1 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
});

// unsupported method

test('time entries rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/timeEntriesService.js', () => ({
    clockIn: jest.fn(),
    clockOut: jest.fn(),
  }));
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'engineer' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 4 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/time-entries/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method GET Not Allowed');
});

// error handling

test('time entries handles service errors', async () => {
  const error = new Error('oops');
  const clockInMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/timeEntriesService.js', () => ({
    clockIn: clockInMock,
    clockOut: jest.fn(),
  }));
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'engineer' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 5 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/time-entries/index.js');
  const req = { method: 'POST', query: { action: 'clock-in' }, body: { job_id: 9 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});

