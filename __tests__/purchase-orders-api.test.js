import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('purchase orders index creates order', async () => {
  const createMock = jest.fn().mockResolvedValue({ id: 1 });
  jest.unstable_mockModule('../services/purchaseOrdersService.js', () => ({
    createPurchaseOrder: createMock,
  }));
  const { default: handler } = await import('../pages/api/purchase-orders/index.js');
  const req = { method: 'POST', body: { order: { supplier_id: 1 }, items: [{ part_id: 2 }] }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(createMock).toHaveBeenCalledWith({ ...req.body.order, items: req.body.items });
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({ id: 1 });
});
