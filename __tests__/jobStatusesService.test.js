import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('deleteJobStatus rejects for unassigned status', async () => {
  const queryMock = jest.fn().mockResolvedValueOnce([[{ name: 'unassigned' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { deleteJobStatus } = await import('../services/jobStatusesService.js');
  await expect(deleteJobStatus(1)).rejects.toThrow('Cannot delete default status');
  expect(queryMock).toHaveBeenCalledTimes(1);
});

test('deleteJobStatus rejects for engineer completed status', async () => {
  const queryMock = jest.fn().mockResolvedValueOnce([[{ name: 'engineer completed' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { deleteJobStatus } = await import('../services/jobStatusesService.js');
  await expect(deleteJobStatus(2)).rejects.toThrow('Cannot delete default status');
  expect(queryMock).toHaveBeenCalledTimes(1);
});

test('deleteJobStatus rejects for notified client for collection status', async () => {
  const queryMock = jest.fn().mockResolvedValueOnce([[{ name: 'notified client for collection' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { deleteJobStatus } = await import('../services/jobStatusesService.js');
  await expect(deleteJobStatus(3)).rejects.toThrow('Cannot delete default status');
  expect(queryMock).toHaveBeenCalledTimes(1);
});

test('deleteJobStatus rejects for awaiting supplier information status', async () => {
  const queryMock = jest.fn().mockResolvedValueOnce([[{ name: 'awaiting supplier information' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { deleteJobStatus } = await import('../services/jobStatusesService.js');
  await expect(deleteJobStatus(4)).rejects.toThrow('Cannot delete default status');
  expect(queryMock).toHaveBeenCalledTimes(1);
});

test('jobStatusExists returns true for awaiting supplier information', async () => {
  const queryMock = jest.fn().mockResolvedValueOnce([[{ id: 9 }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { jobStatusExists } = await import('../services/jobStatusesService.js');
  const result = await jobStatusExists('awaiting supplier information');
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/WHERE name=\?/), ['awaiting supplier information']);
  expect(result).toBe(true);
});
