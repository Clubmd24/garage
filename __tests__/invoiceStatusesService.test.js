import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('deleteInvoiceStatus rejects for issued status', async () => {
  const queryMock = jest.fn().mockResolvedValueOnce([[{ name: 'issued' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { deleteInvoiceStatus } = await import('../services/invoiceStatusesService.js');
  await expect(deleteInvoiceStatus(1)).rejects.toThrow('Cannot delete default status');
  expect(queryMock).toHaveBeenCalledTimes(1);
});

test('deleteInvoiceStatus rejects for paid status', async () => {
  const queryMock = jest.fn().mockResolvedValueOnce([[{ name: 'paid' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { deleteInvoiceStatus } = await import('../services/invoiceStatusesService.js');
  await expect(deleteInvoiceStatus(2)).rejects.toThrow('Cannot delete default status');
  expect(queryMock).toHaveBeenCalledTimes(1);
});

test('deleteInvoiceStatus rejects for unpaid status', async () => {
  const queryMock = jest.fn().mockResolvedValueOnce([[{ name: 'unpaid' }]]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { deleteInvoiceStatus } = await import('../services/invoiceStatusesService.js');
  await expect(deleteInvoiceStatus(3)).rejects.toThrow('Cannot delete default status');
  expect(queryMock).toHaveBeenCalledTimes(1);
});
