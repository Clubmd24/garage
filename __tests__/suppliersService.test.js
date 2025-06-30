import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('getAllSuppliers fetches rows', async () => {
  const rows = [{ id: 1 }];
  const queryMock = jest.fn().mockResolvedValue([rows]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { getAllSuppliers } = await import('../services/suppliersService.js');
  const result = await getAllSuppliers();
  expect(queryMock.mock.calls[0][0]).toMatch(/FROM suppliers/);
  expect(result).toEqual(rows);
});

test('createSupplier inserts row', async () => {
  const queryMock = jest.fn().mockResolvedValue([{ insertId: 2 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { createSupplier } = await import('../services/suppliersService.js');
  const data = { name: 'A' };
  const result = await createSupplier(data);
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/INSERT INTO suppliers/), [
    'A', null, null, null, null, null,
  ]);
  expect(result).toEqual({ id: 2, ...data, address: undefined, contact_number: undefined, email_address: undefined, payment_terms: undefined, credit_limit: undefined });
});

test('updateSupplier updates row', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { updateSupplier } = await import('../services/suppliersService.js');
  const result = await updateSupplier(1, { name: 'B' });
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/UPDATE suppliers/), ['B', null, null, null, null, null, 1]);
  expect(result).toEqual({ ok: true });
});

test('deleteSupplier removes row', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { deleteSupplier } = await import('../services/suppliersService.js');
  const result = await deleteSupplier(3);
  expect(queryMock).toHaveBeenCalledWith('DELETE FROM suppliers WHERE id=?', [3]);
  expect(result).toEqual({ ok: true });
});
