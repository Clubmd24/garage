import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('jobs index returns jobs for date when date query provided', async () => {
  const rows = [{ id: 1 }];
  const dateMock = jest.fn().mockResolvedValue(rows);
  jest.unstable_mockModule('../services/jobsService.js', () => ({
    getJobsForDate: dateMock,
    getJobsByFleet: jest.fn(),
    getJobsByCustomer: jest.fn(),
    getAllJobs: jest.fn(),
    createJob: jest.fn()
  }));
  const { default: handler } = await import('../pages/api/jobs/index.js');
  const req = { method: 'GET', query: { date: '2024-01-01' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(dateMock).toHaveBeenCalledWith('2024-01-01');
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(rows);
});

