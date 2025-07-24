import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('job start endpoint records log', async () => {
  const entry = { id: 1 };
  const startMock = jest.fn().mockResolvedValue(entry);
  jest.unstable_mockModule('../services/jobWorkLogsService.js', () => ({
    logStart: startMock,
    logFinish: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/jobs/[id]/start.js');
  const req = { method: 'POST', query: { id: '5' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(startMock).toHaveBeenCalledWith('5');
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(entry);
});

test('job finish endpoint records log', async () => {
  const entry = { id: 2 };
  const finishMock = jest.fn().mockResolvedValue(entry);
  jest.unstable_mockModule('../services/jobWorkLogsService.js', () => ({
    logStart: jest.fn(),
    logFinish: finishMock,
  }));
  const { default: handler } = await import('../pages/api/jobs/[id]/finish.js');
  const req = { method: 'POST', query: { id: '6' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(finishMock).toHaveBeenCalledWith('6');
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(entry);
});


test('job start endpoint rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/jobWorkLogsService.js', () => ({
    logStart: jest.fn(),
    logFinish: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/jobs/[id]/start.js');
  const req = { method: 'GET', query: { id: '1' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method GET Not Allowed');
});
