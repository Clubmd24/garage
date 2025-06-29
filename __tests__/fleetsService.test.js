import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('getAllFleets fetches fleets', async () => {
  const rows = [{ id: 1 }];
  const queryMock = jest.fn().mockResolvedValue([rows]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { getAllFleets } = await import('../services/fleetsService.js');
  const result = await getAllFleets();
  expect(queryMock).toHaveBeenCalledTimes(1);
  expect(queryMock.mock.calls[0][0]).toMatch(/FROM fleets/);
  expect(result).toEqual(rows);
});

test('getFleetById fetches single fleet', async () => {
  const row = { id: 2 };
  const queryMock = jest.fn().mockResolvedValue([[row]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { getFleetById } = await import('../services/fleetsService.js');
  const result = await getFleetById(2);
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/WHERE id=\?/), [2]);
  expect(result).toEqual(row);
});
