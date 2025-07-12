import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  delete process.env.API_SECRET;
});

test('POST /api/standards/ingest starts ingestion', async () => {
  process.env.API_SECRET = 'shhh';
  const ingestMock = jest.fn().mockResolvedValue();
  jest.unstable_mockModule('../services/standardIngestService.js', () => ({
    ingestStandards: ingestMock,
  }));
  const { default: handler } = await import('../pages/api/standards/ingest.js');
  const req = { method: 'POST', headers: {}, query: { secret: 'shhh' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(202);
  expect(ingestMock).toHaveBeenCalled();
});

test('GET /api/standards/status returns status', async () => {
  process.env.API_SECRET = 'shhh';
  const statusMock = jest.fn().mockReturnValue(true);
  jest.unstable_mockModule('../services/standardIngestService.js', () => ({
    getIngestStatus: statusMock,
  }));
  const { default: handler } = await import('../pages/api/standards/status.js');
  const req = { method: 'GET', headers: {}, query: { secret: 'shhh' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ running: true });
});

test('POST /api/standards/ingest rejects invalid secret', async () => {
  process.env.API_SECRET = 'shhh';
  const ingestMock = jest.fn();
  jest.unstable_mockModule('../services/standardIngestService.js', () => ({
    ingestStandards: ingestMock,
  }));
  const { default: handler } = await import('../pages/api/standards/ingest.js');
  const req = { method: 'POST', headers: {}, query: { secret: 'nope' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
  expect(ingestMock).not.toHaveBeenCalled();
});

test('GET /api/standards/status rejects invalid secret', async () => {
  process.env.API_SECRET = 'shhh';
  const statusMock = jest.fn();
  jest.unstable_mockModule('../services/standardIngestService.js', () => ({
    getIngestStatus: statusMock,
  }));
  const { default: handler } = await import('../pages/api/standards/status.js');
  const req = { method: 'GET', headers: {}, query: { secret: 'wrong' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
  expect(statusMock).not.toHaveBeenCalled();
});
