import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('history excludes messages marked deleted', async () => {
  const rows = [
    { id: 2, user: 'bob', body: 'hi', s3_key: null, content_type: null, created_at: '2024-01-01T00:00:00Z' },
  ];
  const queryMock = jest.fn().mockResolvedValueOnce([rows]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { default: handler } = await import('../pages/api/chat/history.js?nocache=' + Date.now());
  const req = { query: { room_id: '1', limit: '50' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await handler(req, res);
  expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('deleted_at IS NULL'), [1, 50]);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith([
    { ...rows[0], mentions: [] },
  ]);
});
