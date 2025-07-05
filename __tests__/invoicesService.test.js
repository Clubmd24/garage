import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('getAllInvoices fetches invoices', async () => {
  const rows = [{ id: 1 }];
  const queryMock = jest.fn().mockResolvedValue([rows]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { getAllInvoices } = await import('../services/invoicesService.js');
  const result = await getAllInvoices();
  expect(queryMock).toHaveBeenCalledTimes(1);
  expect(queryMock.mock.calls[0][0]).toMatch(/FROM invoices/);
  expect(result).toEqual(rows);
});

test('getInvoiceById fetches single invoice', async () => {
  const row = { id: 2 };
  const queryMock = jest.fn().mockResolvedValue([[row]]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { getInvoiceById } = await import('../services/invoicesService.js');
  const result = await getInvoiceById(2);
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/WHERE id=\?/), [2]);
  expect(result).toEqual(row);
});

test('createInvoice inserts invoice', async () => {
  const queryMock = jest.fn().mockResolvedValue([{ insertId: 3 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { createInvoice } = await import('../services/invoicesService.js');
  const data = { job_id: 1, customer_id: 2, amount: 99, due_date: '2024-06-01', status: 'open' };
  const result = await createInvoice(data);
  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/INSERT INTO invoices/),
    [1, 2, 99, '2024-06-01', 'open', null]
  );
  expect(result).toEqual({ id: 3, ...data });
});

test('updateInvoice updates row', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { updateInvoice } = await import('../services/invoicesService.js');
  const data = { job_id: 4, customer_id: 5, amount: 8, due_date: '2024-07-01', status: 'paid' };
  const result = await updateInvoice(6, data);
  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/UPDATE invoices/),
    [4, 5, 8, '2024-07-01', 'paid', null, 6]
  );
  expect(result).toEqual({ ok: true });
});

test('deleteInvoice removes row', async () => {
  const queryMock = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule('../lib/db.js', () => ({
    default: { query: queryMock },
  }));
  const { deleteInvoice } = await import('../services/invoicesService.js');
  const result = await deleteInvoice(7);
  expect(queryMock).toHaveBeenCalledWith('DELETE FROM invoices WHERE id=?', [7]);
  expect(result).toEqual({ ok: true });
});
