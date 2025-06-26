import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('dev project delete returns 401 when unauthenticated', async () => {
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: jest.fn() },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => null,
  }));
  const { default: handler } = await import('../pages/api/dev/projects/[id].js');
  const req = { method: 'DELETE', query: { id: 1 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
});

test('dev project delete succeeds when authenticated', async () => {
  const queryMock = jest.fn().mockResolvedValueOnce([{ affectedRows: 1 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  jest.unstable_mockModule('../lib/auth.js', () => ({
    getTokenFromReq: () => ({ sub: 1 }),
  }));
  const { default: handler } = await import('../pages/api/dev/projects/[id].js');
  const req = { method: 'DELETE', query: { id: 5 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(queryMock).toHaveBeenCalledWith('DELETE FROM dev_projects WHERE id=?', [5]);
  expect(res.json).toHaveBeenCalledWith({ ok: true });
});
