import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('admin users index returns 403 for non-admin', async () => {
  const queryMock = jest.fn().mockResolvedValueOnce([[{ name: 'viewer' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 1 }),
    hashPassword: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/admin/users/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
  expect(queryMock).toHaveBeenCalledTimes(1);
});

test('admin user delete returns 403 for non-admin', async () => {
  const queryMock = jest.fn().mockResolvedValueOnce([[{ name: 'user' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 2 }),
    hashPassword: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/admin/users/[id].js');
  const req = { method: 'DELETE', query: { id: 3 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
  expect(queryMock).toHaveBeenCalledTimes(1);
});

test('admin users index allows developer role', async () => {
  const queryMock = jest
    .fn()
    .mockResolvedValueOnce([[{ name: 'developer' }]])
    .mockResolvedValueOnce([[]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 3 }),
    hashPassword: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/admin/users/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith([]);
  expect(queryMock).toHaveBeenCalledTimes(2);
});

test('admin user delete allows developer role', async () => {
  const queryMock = jest
    .fn()
    .mockResolvedValueOnce([[{ name: 'developer' }]])
    .mockResolvedValueOnce([{}])
    .mockResolvedValueOnce([{ affectedRows: 1 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 4 }),
    hashPassword: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/admin/users/[id].js');
  const req = { method: 'DELETE', query: { id: 5 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ success: true });
  expect(queryMock).toHaveBeenCalledTimes(3);
});
