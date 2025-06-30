import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('createPurchaseOrder inserts order', async () => {
  const queryMock = jest.fn().mockResolvedValue([{ insertId: 5 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { createPurchaseOrder } = await import('../services/purchaseOrdersService.js');
  const data = { job_id: 1, supplier_id: 2, status: 'new' };
  const result = await createPurchaseOrder(data);
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/INSERT INTO purchase_orders/), [1, 2, 'new']);
  expect(result).toEqual({ id: 5, ...data });
});

test('addPurchaseOrderItem inserts item', async () => {
  const queryMock = jest.fn().mockResolvedValue([{ insertId: 7 }]);
  jest.unstable_mockModule('../lib/db.js', () => ({ default: { query: queryMock } }));
  const { addPurchaseOrderItem } = await import('../services/purchaseOrdersService.js');
  const data = { purchase_order_id: 5, part_id: 6, qty: 2, unit_price: 3 };
  const result = await addPurchaseOrderItem(data);
  expect(queryMock).toHaveBeenCalledWith(expect.stringMatching(/INSERT INTO purchase_order_items/), [5, 6, 2, 3]);
  expect(result).toEqual({ id: 7, ...data });
});
