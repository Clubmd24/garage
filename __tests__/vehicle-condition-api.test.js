import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('get condition reports', async () => {
  const data = [{ id: 1 }];
  const listMock = jest.fn().mockResolvedValue(data);
  jest.unstable_mockModule('../services/vehicleConditionReportsService.js', () => ({
    listReports: listMock,
    createReport: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/jobs/[id]/condition.js');
  const req = { method: 'GET', query: { id: '3' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(listMock).toHaveBeenCalledWith('3');
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(data);
});

test('post condition report', async () => {
  const record = { id: 2 };
  const createMock = jest.fn().mockResolvedValue(record);
  jest.unstable_mockModule('../services/vehicleConditionReportsService.js', () => ({
    listReports: jest.fn(),
    createReport: createMock,
  }));
  const { default: handler } = await import('../pages/api/jobs/[id]/condition.js');
  const req = { method: 'POST', query: { id: '5' }, body: { description: 'd' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(createMock).toHaveBeenCalledWith({ job_id: '5', user_id: null, description: 'd', photo_url: undefined, none: undefined });
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(record);
});

test('reject unsupported method', async () => {
  jest.unstable_mockModule('../services/vehicleConditionReportsService.js', () => ({
    listReports: jest.fn(),
    createReport: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/jobs/[id]/condition.js');
  const req = { method: 'PUT', query: { id: '1' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'POST']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method PUT Not Allowed');
});
