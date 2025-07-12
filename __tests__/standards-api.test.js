import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('POST /api/standards/ingest starts ingestion', async () => {
  const ingestMock = jest.fn().mockResolvedValue();
  jest.unstable_mockModule('../services/standardIngestService.js', () => ({
    ingestStandards: ingestMock,
  }));
  const { default: handler } = await import('../pages/api/standards/ingest.js');
  const req = { method: 'POST', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(202);
  expect(ingestMock).toHaveBeenCalled();
});

test('GET /api/standards/status returns status', async () => {
  const statusMock = jest.fn().mockReturnValue(true);
  jest.unstable_mockModule('../services/standardIngestService.js', () => ({
    getIngestStatus: statusMock,
  }));
  const { default: handler } = await import('../pages/api/standards/status.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ running: true });
});
