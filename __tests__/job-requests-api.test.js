import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

// GET unauthorized

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

// GET success

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
