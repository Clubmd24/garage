import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('createPart inserts row', async () => {
  const queryMock = jest.fn().mockResolvedValue([{ insertId: 3 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { createPart } = await import('../services/partsService.js');
  const data = { part_number: 'A', description: 'B', unit_cost: 1.2, supplier_id: 4 };
  const result = await createPart(data);
  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/INSERT INTO parts/),
    ['A', 'B', 1.2, 4]
  );
  expect(result).toEqual({ id: 3, ...data });
});
