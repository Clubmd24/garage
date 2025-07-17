import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('createCategory inserts row', async () => {
  const queryMock = jest.fn().mockResolvedValue([{ insertId: 4 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { createCategory } = await import('../services/categoriesService.js');
  const result = await createCategory({ name: 'Cat' });
  expect(queryMock).toHaveBeenCalledWith('INSERT INTO part_categories (name) VALUES (?)', ['Cat']);
  expect(result).toEqual({ id: 4, name: 'Cat' });
});

test('updateCategory updates row', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { updateCategory } = await import('../services/categoriesService.js');
  const result = await updateCategory(5, { name: 'Updated' });
  expect(queryMock).toHaveBeenCalledWith('UPDATE part_categories SET name=? WHERE id=?', ['Updated', 5]);
  expect(result).toEqual({ ok: true });
});

test('deleteCategory deletes row', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { deleteCategory } = await import('../services/categoriesService.js');
  const result = await deleteCategory(6);
  expect(queryMock).toHaveBeenCalledWith('DELETE FROM part_categories WHERE id=?', [6]);
  expect(result).toEqual({ ok: true });
});
