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

test('GET /api/standards/status returns status and standards', async () => {
  process.env.API_SECRET = 'shhh';
  const statusMock = jest.fn().mockReturnValue(true);
  jest.unstable_mockModule('../services/standardIngestService.js', () => ({
    getIngestStatus: statusMock,
  }));
  const rows = [
    {
      id: 1,
      code: 'STD',
      source: 'example',
      version: '1.0',
      last_fetched_at: '2024-01-01',
    },
  ];
  const queryMock = jest.fn().mockResolvedValue([rows]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));

  const { default: handler } = await import('../pages/api/standards/status.js');
  const req = { method: 'GET', headers: {}, query: { secret: 'shhh' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(queryMock).toHaveBeenCalledWith(expect.any(String));
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ running: true, standards: rows });
});

test('GET /api/standards/status includes fields', async () => {
  process.env.API_SECRET = 'shhh';
  const statusMock = jest.fn().mockReturnValue(false);
  jest.unstable_mockModule('../services/standardIngestService.js', () => ({
    getIngestStatus: statusMock,
  }));
  const rows = [
    {
      id: 2,
      code: 'X',
      source: 'src',
      version: 'v2',
      last_fetched_at: '2024-02-02',
    },
  ];
  const queryMock = jest.fn().mockResolvedValue([rows]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));

  const { default: handler } = await import('../pages/api/standards/status.js');
  const req = { method: 'GET', headers: {}, query: { secret: 'shhh' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  const payload = res.json.mock.calls[0][0];
  expect(payload.standards[0]).toEqual(rows[0]);
  expect(payload).toHaveProperty('running', false);
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

test('GET /api/standards/[id] returns questions', async () => {
  process.env.API_SECRET = 'shhh';
  const rows = [
    { no: 1, text: 'Q1' },
    { no: 2, text: 'Q2' },
  ];
  const queryMock = jest.fn().mockResolvedValue([rows]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { default: handler } = await import('../pages/api/standards/[id].js');
  const req = { method: 'GET', headers: {}, query: { id: '1', secret: 'shhh' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(queryMock).toHaveBeenCalledWith(expect.any(String), ['1']);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ questions: rows });
});

test('GET /api/standards/[id] rejects invalid secret', async () => {
  process.env.API_SECRET = 'shhh';
  const queryMock = jest.fn();
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { default: handler } = await import('../pages/api/standards/[id].js');
  const req = { method: 'GET', headers: {}, query: { id: '1', secret: 'nope' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
  expect(queryMock).not.toHaveBeenCalled();
});
