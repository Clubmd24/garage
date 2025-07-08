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
    [4, null, null, null, 'notified client for collection', null, 2]
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
