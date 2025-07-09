import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('purchase order request quote updates order and job', async () => {
  const updatePo = jest.fn().mockResolvedValue({ ok: true });
  const getPo = jest.fn().mockResolvedValue({ id: 7, job_id: 2 });
  const updateJob = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/purchaseOrdersService.js', () => ({
    updatePurchaseOrder: updatePo,
    getPurchaseOrderById: getPo,
  }));
  jest.unstable_mockModule('../services/jobsService.js', () => ({
    updateJob,
  }));
  const { default: handler } = await import('../pages/api/purchase-orders/[id]/request-quote.js');
  const req = { method: 'POST', query: { id: '7' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(updatePo).toHaveBeenCalledWith('7', { status: 'awaiting supplier quote' });
  expect(getPo).toHaveBeenCalledWith('7');
  expect(updateJob).toHaveBeenCalledWith(2, { status: 'awaiting supplier information' });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ ok: true });
});

test('request quote rejects unsupported method', async () => {
  jest.unstable_mockModule('../services/purchaseOrdersService.js', () => ({
    updatePurchaseOrder: jest.fn(),
    getPurchaseOrderById: jest.fn(),
  }));
  jest.unstable_mockModule('../services/jobsService.js', () => ({ updateJob: jest.fn() }));
  const { default: handler } = await import('../pages/api/purchase-orders/[id]/request-quote.js');
  const req = { method: 'GET', query: { id: '7' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.end).toHaveBeenCalledWith('Method GET Not Allowed');
});
