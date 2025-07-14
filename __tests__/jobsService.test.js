import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('updateJob creates invoice when notifying client for collection', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  const createInvoiceMock = jest.fn().mockResolvedValue({ id: 9 });
  const existsMock = jest.fn().mockResolvedValue(true);

  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  jest.unstable_mockModule('../services/invoicesService.js', () => ({ createInvoice: createInvoiceMock }));
  jest.unstable_mockModule('../services/jobStatusesService.js', () => ({ jobStatusExists: existsMock }));

  const { updateJob } = await import('../services/jobsService.js');
  const data = { customer_id: 4, status: 'notified client for collection' };
  const result = await updateJob(2, data);

  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/UPDATE jobs/),
    [4, 'notified client for collection', 2]
  );
  expect(createInvoiceMock).toHaveBeenCalledWith({ job_id: 2, customer_id: 4, status: 'awaiting collection' });
  expect(result).toEqual({ ok: true });
});

test('updateJob does not create invoice for other statuses', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  const createInvoiceMock = jest.fn();
  const existsMock = jest.fn().mockResolvedValue(true);

  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  jest.unstable_mockModule('../services/invoicesService.js', () => ({ createInvoice: createInvoiceMock }));
  jest.unstable_mockModule('../services/jobStatusesService.js', () => ({ jobStatusExists: existsMock }));

  const { updateJob } = await import('../services/jobsService.js');
  await updateJob(3, { status: 'in progress' });

  expect(createInvoiceMock).not.toHaveBeenCalled();
});

test('updateJob validates status exists', async () => {
  const existsMock = jest.fn().mockResolvedValue(false);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: jest.fn() } }));
  jest.unstable_mockModule('../services/invoicesService.js', () => ({ createInvoice: jest.fn() }));
  jest.unstable_mockModule('../services/jobStatusesService.js', () => ({ jobStatusExists: existsMock }));

  const { updateJob } = await import('../services/jobsService.js');
  await expect(updateJob(1, { status: 'bad status' })).rejects.toThrow('Invalid job status');
});

test('engineer completes job then office notifies client for collection', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  const createInvoiceMock = jest.fn().mockResolvedValue({ id: 11 });
  const existsMock = jest.fn().mockResolvedValue(true);

  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  jest.unstable_mockModule('../services/invoicesService.js', () => ({ createInvoice: createInvoiceMock }));
  jest.unstable_mockModule('../services/jobStatusesService.js', () => ({ jobStatusExists: existsMock }));

  const { updateJob } = await import('../services/jobsService.js');

  await updateJob(5, { status: 'engineer completed' });
  await updateJob(5, { customer_id: 8, status: 'notified client for collection' });

  expect(queryMock).toHaveBeenNthCalledWith(
    1,
    expect.stringMatching(/UPDATE jobs/),
    ['engineer completed', 5]
  );
  expect(queryMock).toHaveBeenNthCalledWith(
    2,
    expect.stringMatching(/UPDATE jobs/),
    [8, 'notified client for collection', 5]
  );
  expect(createInvoiceMock).toHaveBeenCalledWith({ job_id: 5, customer_id: 8, status: 'awaiting collection' });
});

test('updateJob updates notes', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  const existsMock = jest.fn().mockResolvedValue(true);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  jest.unstable_mockModule('../services/invoicesService.js', () => ({ createInvoice: jest.fn() }));
  jest.unstable_mockModule('../services/jobStatusesService.js', () => ({ jobStatusExists: existsMock }));

  const { updateJob } = await import('../services/jobsService.js');
  await updateJob(7, { notes: 'hello' });

  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/UPDATE jobs/),
    ['hello', 7]
  );
});

test('getJobsInRange returns unscheduled jobs', async () => {
  const rows = [{
    id: 3,
    customer_id: 1,
    vehicle_id: 2,
    licence_plate: 'TEST123',
    scheduled_start: null,
    scheduled_end: null,
    status: 'unassigned',
    bay: null,
    engineer_ids: null,
  }];
  const queryMock = jest.fn().mockResolvedValue([rows]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { getJobsInRange } = await import('../services/jobsService.js');
  const result = await getJobsInRange('2024-01-01', '2024-01-31');
  expect(queryMock).toHaveBeenCalledWith(expect.any(String), ['2024-01-01', '2024-01-31']);
  expect(result).toEqual([
    {
      id: 3,
      customer_id: 1,
      vehicle_id: 2,
      licence_plate: 'TEST123',
      scheduled_start: null,
      scheduled_end: null,
      status: 'unassigned',
      bay: null,
      assignments: [],
    },
  ]);
});
