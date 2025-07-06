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

test('updateQuoteItem updates row', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { updateQuoteItem } = await import('../services/quoteItemsService.js');
  const result = await updateQuoteItem(5, {
    description: 'x',
    qty: 2,
    unit_cost: 1,
    markup_percent: 20,
    unit_price: 3,
  });
  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/UPDATE quote_items/),
    ['x', 2, 1, 20, 3, 5]
  );
  expect(result).toEqual({ ok: true });
});
