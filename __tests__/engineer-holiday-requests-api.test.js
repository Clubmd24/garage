import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

// GET success

test('holiday requests list own requests', async () => {
  const rows = [{ id: 1 }];
  const listMock = jest.fn().mockResolvedValue(rows);
  jest.unstable_mockModule('../services/holidayRequestsService.js', () => ({
    listRequests: listMock,
    submitRequest: jest.fn(),
  }));
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'engineer' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 1 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/holiday-requests/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(listMock).toHaveBeenCalledWith(1);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(rows);
});

// POST success

test('holiday requests submit creates request', async () => {
  const created = { id: 2 };
  const submitMock = jest.fn().mockResolvedValue(created);
  jest.unstable_mockModule('../services/holidayRequestsService.js', () => ({
    listRequests: jest.fn(),
    submitRequest: submitMock,
  }));
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'engineer' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 2 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/holiday-requests/index.js');
  const req = { method: 'POST', body: { start_date: '2024-01-01', end_date: '2024-01-05', status: 'pending' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(submitMock).toHaveBeenCalledWith({
    employee_id: 2,
    start_date: '2024-01-01',
    end_date: '2024-01-05',
    status: 'pending',
  });
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(created);
});

// authentication and role checks

test('holiday requests returns 401 when unauthenticated', async () => {
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: jest.fn() },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => null,
  }));
  const { default: handler } = await import('../pages/api/engineer/holiday-requests/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
});

test('holiday requests returns 403 for non-engineer role', async () => {
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'user' }]]);
  jest.unstable_mockModule('../services/holidayRequestsService.js', () => ({
    listRequests: jest.fn(),
    submitRequest: jest.fn(),
  }));
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 3 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/holiday-requests/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
});

// unsupported method

test('holiday requests rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/holidayRequestsService.js', () => ({
    listRequests: jest.fn(),
    submitRequest: jest.fn(),
  }));
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'engineer' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 4 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/holiday-requests/index.js');
  const req = { method: 'PUT', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'POST']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method PUT Not Allowed');
});

// error handling

test('holiday requests handles service errors', async () => {
  const error = new Error('oops');
  const listMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/holidayRequestsService.js', () => ({
    listRequests: listMock,
    submitRequest: jest.fn(),
  }));
  const queryMock = jest.fn().mockResolvedValue([[{ name: 'engineer' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 5 }),
  }));
  const { default: handler } = await import('../pages/api/engineer/holiday-requests/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});

