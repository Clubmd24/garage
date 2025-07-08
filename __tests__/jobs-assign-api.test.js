import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('assign endpoint assigns engineer and updates job', async () => {
  const assignMock = jest.fn().mockResolvedValue({ id: 2 });
  const updateMock = jest.fn().mockResolvedValue({ ok: true });
  const job = { id: 1, status: 'awaiting assessment' };
  const getMock = jest.fn().mockResolvedValue(job);
  jest.unstable_mockModule('../services/jobsService.js', () => ({
    assignUser: assignMock,
    updateJob: updateMock,
    getJobDetails: getMock,
  }));
  const { default: handler } = await import('../pages/api/jobs/[id]/assign.js');
  const req = {
    method: 'POST',
    query: { id: '1' },
    body: { engineer_id: 5, scheduled_start: '2024-01-02', scheduled_end: '2024-01-03' },
  };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(assignMock).toHaveBeenCalledWith('1', 5);
  expect(updateMock).toHaveBeenCalledWith('1', {
    status: 'awaiting assessment',
    scheduled_start: '2024-01-02',
    scheduled_end: '2024-01-03',
  });
  expect(getMock).toHaveBeenCalledWith('1');
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(job);
});

test('assign endpoint rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/jobsService.js', () => ({
    assignUser: jest.fn(),
    updateJob: jest.fn(),
    getJobDetails: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/jobs/[id]/assign.js');
  const req = { method: 'GET', query: { id: '1' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method GET Not Allowed');
});

test('assign endpoint handles errors', async () => {
  const error = new Error('fail');
  const assignMock = jest.fn().mockRejectedValue(error);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.unstable_mockModule('../services/jobsService.js', () => ({
    assignUser: assignMock,
    updateJob: jest.fn(),
    getJobDetails: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/jobs/[id]/assign.js');
  const req = { method: 'POST', query: { id: '1' }, body: { engineer_id: 2 } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});
