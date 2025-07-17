import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('createPart inserts row', async () => {
  const queryMock = jest.fn().mockResolvedValue([{ insertId: 3 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { createPart } = await import('../services/partsService.js');
  const data = { part_number: 'A', description: 'B', unit_cost: 1.2, supplier_id: 4, category_id: 7 };
  const result = await createPart(data);
  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/INSERT INTO parts/),
    ['A', 'B', 1.2, 4, 7]
  );
  expect(result).toEqual({ id: 3, ...data });
});

test('updatePart updates row', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { updatePart } = await import('../services/partsService.js');
  const result = await updatePart(1, { part_number: 'X', supplier_id: 5, category_id: 9 });
  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/UPDATE parts/),
    ['X', null, null, 5, 9, 1]
  );
  expect(result).toEqual({ ok: true });
});

test('deletePart removes row', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { deletePart } = await import('../services/partsService.js');
  const result = await deletePart(2);
  expect(queryMock).toHaveBeenCalledWith('DELETE FROM parts WHERE id=?', [2]);
  expect(result).toEqual({ ok: true });
});
