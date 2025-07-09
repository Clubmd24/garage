import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('search endpoint returns results', async () => {
  const result = { clients: [] };
  const searchMock = jest.fn().mockResolvedValue(result);
  jest.unstable_mockModule('../services/masterSearchService.js', () => ({
    masterSearch: searchMock,
  }));
  const { default: handler } = await import('../pages/api/search.js');
  const req = { method: 'GET', query: { q: 'abc' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(searchMock).toHaveBeenCalledWith('abc');
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(result);
});

test('search endpoint rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/masterSearchService.js', () => ({
    masterSearch: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/search.js');
  const req = { method: 'POST', query: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method POST Not Allowed');
});

test('search endpoint handles errors', async () => {
  const searchMock = jest.fn().mockRejectedValue(new Error('fail'));
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/masterSearchService.js', () => ({
    masterSearch: searchMock,
  }));
  const { default: handler } = await import('../pages/api/search.js');
  const req = { method: 'GET', query: { q: 'x' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});
