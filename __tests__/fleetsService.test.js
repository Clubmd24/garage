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

test('resetFleetPin updates hash and returns pin', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const hashMock = jest.fn(async () => 'HASH');
  jest.unstable_mockModule('../lib/auth.js', () => ({
    hashPassword: hashMock,
  }));
  jest.spyOn(Math, 'random').mockReturnValue(0.5);
  const { resetFleetPin } = await import('../services/fleetsService.js');
  const pin = await resetFleetPin(3);
  expect(pin).toBe('5500');
  expect(hashMock).toHaveBeenCalledWith('5500');
  expect(queryMock).toHaveBeenCalledWith(
    'UPDATE fleets SET pin_hash=?, pin=? WHERE id=?',
    ['HASH', '5500', 3]
  );
  Math.random.mockRestore();
});
