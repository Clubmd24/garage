import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

// GET /engineer/jobs success

test('engineer jobs returns active jobs for engineer', async () => {
  const jobs = [
    { id: 1, status: 'in progress' },
    { id: 2, status: 'completed' },
  ];
  const listMock = jest.fn().mockResolvedValue(jobs);
  jest.unstable_mockModule('../services/jobsService.js', () => ({
    listActiveJobsForEngineer: listMock,
  }));
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'engineer' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
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

// authentication and role checks

test('engineer jobs returns 401 when unauthenticated', async () => {
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: jest.fn() },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => null,
  }));
  const { default: handler } = await import('../pages/api/engineer/jobs/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
});

test('engineer jobs returns 403 for non-engineer role', async () => {
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'manager' }]]);
  jest.unstable_mockModule('../services/jobsService.js', () => ({
    listActiveJobsForEngineer: jest.fn(),
  }));
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 2 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/jobs/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
});

// unsupported method

test('engineer jobs rejects unsupported method', async () => {
  const listMock = jest.fn();
  jest.unstable_mockModule('../services/jobsService.js', () => ({
    listActiveJobsForEngineer: listMock,
  }));
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'engineer' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 3 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/jobs/index.js');
  const req = { method: 'POST', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method POST Not Allowed');
});

// error handling

test('engineer jobs handles errors from service', async () => {
  const error = new Error('fail');
  const listMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/jobsService.js', () => ({
    listActiveJobsForEngineer: listMock,
  }));
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'engineer' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 4 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/jobs/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});

