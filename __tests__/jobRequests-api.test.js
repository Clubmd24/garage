import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('job requests index returns 401 when unauthenticated', async () => {
  jest.unstable_mockModule('../services/jobRequestsService.js', () => ({
    getAllJobRequests: jest.fn(),
    createJobRequest: jest.fn(),
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => null,
    verifyToken: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/job-requests/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
});

test('job requests index returns requests when authenticated', async () => {
  const rows = [{ id: 1 }];
  const listMock = jest.fn().mockResolvedValue(rows);
  jest.unstable_mockModule('../services/jobRequestsService.js', () => ({
    getAllJobRequests: listMock,
    createJobRequest: jest.fn(),
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 1 }),
    verifyToken: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/job-requests/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(listMock).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(rows);
});

test('job requests create returns 401 without token', async () => {
  jest.unstable_mockModule('../services/jobRequestsService.js', () => ({
    getAllJobRequests: jest.fn(),
    createJobRequest: jest.fn(),
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    verifyToken: jest.fn(),
    getTokenFromReq: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/job-requests/index.js');
  const req = { method: 'POST', headers: { cookie: '' }, body: { vehicle_id: 2, description: 'd' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
});

test('job requests create saves request when token valid', async () => {
  const created = { id: 5 };
  const createMock = jest.fn().mockResolvedValue(created);
  const verifyMock = jest.fn().mockReturnValue({ fleet_id: 3, client_id: 4 });
  jest.unstable_mockModule('../services/jobRequestsService.js', () => ({
    getAllJobRequests: jest.fn(),
    createJobRequest: createMock,
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: jest.fn(),
    verifyToken: verifyMock,
  }));
  const { default: handler } = await import('../pages/api/job-requests/index.js');
  const req = { method: 'POST', headers: { cookie: 'fleet_token=abc' }, body: { vehicle_id: 7, description: 'fix' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(verifyMock).toHaveBeenCalledWith('abc');
  expect(createMock).toHaveBeenCalledWith({
    fleet_id: 3,
    client_id: 4,
    vehicle_id: 7,
    description: 'fix',
  });
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(created);
});
