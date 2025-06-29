import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('getAllQuotes fetches quotes', async () => {
  const rows = [{ id: 1 }];
  const queryMock = jest.fn().mockResolvedValue([rows]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { getAllQuotes } = await import('../services/quotesService.js');
  const result = await getAllQuotes();
  expect(queryMock).toHaveBeenCalledTimes(1);
  expect(queryMock.mock.calls[0][0]).toMatch(/FROM quotes/);
  expect(result).toEqual(rows);
});

test('getQuoteById fetches single quote', async () => {
  const row = { id: 2 };
  const queryMock = jest.fn().mockResolvedValue([[row]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { getQuoteById } = await import('../services/quotesService.js');
  const result = await getQuoteById(2);
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/WHERE id=\?/), [2]);
  expect(result).toEqual(row);
});

test('createQuote inserts quote', async () => {
  const queryMock = jest.fn().mockResolvedValue([{ insertId: 3 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { createQuote } = await import('../services/quotesService.js');
  const data = { customer_id: 1, job_id: 2, total_amount: 50, status: 'new' };
  const result = await createQuote(data);
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/INSERT INTO quotes/), [1, 2, 50, 'new']);
  expect(result).toEqual({ id: 3, ...data });
});

test('updateQuote updates row', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { updateQuote } = await import('../services/quotesService.js');
  const data = { customer_id: 4, job_id: 5, total_amount: 6, status: 'sent' };
  const result = await updateQuote(7, data);
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/UPDATE quotes/), [4, 5, 6, 'sent', 7]);
  expect(result).toEqual({ ok: true });
});

test('deleteQuote removes row', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { deleteQuote } = await import('../services/quotesService.js');
  const result = await deleteQuote(8);
  expect(queryMock).toHaveBeenCalledWith('DELETE FROM quotes WHERE id=?', [8]);
  expect(result).toEqual({ ok: true });
});
