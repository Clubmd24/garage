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
