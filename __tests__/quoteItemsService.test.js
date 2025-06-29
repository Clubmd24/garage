import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('getQuoteItems fetches items', async () => {
  const rows = [{ id: 1 }];
  const queryMock = jest.fn().mockResolvedValue([rows]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { getQuoteItems } = await import('../services/quoteItemsService.js');
  const result = await getQuoteItems(2);
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/FROM quote_items/), [2]);
  expect(result).toEqual(rows);
});
