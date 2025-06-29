import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('createJobRequest inserts request', async () => {
  const queryMock = jest.fn().mockResolvedValue([{ insertId: 5 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { createJobRequest } = await import('../services/jobRequestsService.js');
  const data = { fleet_id: 1, client_id: 2, vehicle_id: 3, description: 'test' };
  const result = await createJobRequest(data);
  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/INSERT INTO job_requests/),
    [1, 2, 3, 'test']
  );
  expect(result).toEqual({ id: 5, ...data });
});

test('getAllJobRequests fetches requests', async () => {
  const rows = [{ id: 1 }];
  const queryMock = jest.fn().mockResolvedValue([rows]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { getAllJobRequests } = await import('../services/jobRequestsService.js');
  const result = await getAllJobRequests();
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/FROM job_requests/));
  expect(result).toEqual(rows);
});
