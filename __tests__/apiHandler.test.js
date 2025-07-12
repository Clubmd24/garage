import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('passes through successful handler', async () => {
  jest.unstable_mockModule('../lib/logger.js', () => {
    const log = { info: jest.fn(), error: jest.fn() };
    return {
      default: log,
      requestLogger: jest.fn(() => log),
    };
  });
  const { default: withApiHandler } = await import('../lib/apiHandler.js');
  const fn = jest.fn(async (req, res) => {
    res.status(200).json({ ok: true });
  });
  const wrapped = withApiHandler(fn);
  const req = { method: 'GET', url: '/', headers: {}, user: { id: 1 } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), headersSent: false, setHeader: jest.fn() };
  await wrapped(req, res);
  expect(fn).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ ok: true });
});

test('catches errors and responds with 500', async () => {
  jest.unstable_mockModule('../lib/logger.js', () => {
    const log = { info: jest.fn(), error: jest.fn() };
    return {
      default: log,
      requestLogger: jest.fn(() => log),
    };
  });
  const { default: withApiHandler } = await import('../lib/apiHandler.js');
  const err = new Error('fail');
  const fn = jest.fn(() => { throw err; });
  const wrapped = withApiHandler(fn);
  const req = { method: 'GET', url: '/foo', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), headersSent: false, setHeader: jest.fn() };
  await wrapped(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'internal_error' }));
});
