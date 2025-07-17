import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

// start-day GET
test('get active session', async () => {
  const sess = { id: 1 };
  jest.unstable_mockModule('../services/posSessionsService.js', () => ({
    getActiveSession: jest.fn().mockResolvedValue(sess),
    startSession: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/epos/start-day.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(sess);
});

// start-day POST
test('start session returns new session', async () => {
  const sess = { id: 2 };
  const startMock = jest.fn().mockResolvedValue(sess);
  jest.unstable_mockModule('../services/posSessionsService.js', () => ({
    getActiveSession: jest.fn(),
    startSession: startMock,
  }));
  const { default: handler } = await import('../pages/api/epos/start-day.js');
  const body = { start_50: 1, start_20: 0, start_10: 0, start_5: 1, start_coins: 0.5 };
  const req = { method: 'POST', body, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(startMock).toHaveBeenCalledWith(body);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(sess);
});

// record sale
test('record sale posts items', async () => {
  const sale = { id: 3 };
  const recordMock = jest.fn().mockResolvedValue(sale);
  const addMock = jest.fn();
  jest.unstable_mockModule('../services/posSalesService.js', () => ({
    recordSale: recordMock,
  }));
  jest.unstable_mockModule('../services/posSaleItemsService.js', () => ({
    addSaleItem: addMock,
  }));
  const { default: handler } = await import('../pages/api/epos/sales.js');
  const req = { method: 'POST', body: { session_id: 1, payment_type: 'cash', total_amount: 10, items: [{ part_id: 1, qty: 2, unit_price: 5 }] }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(recordMock).toHaveBeenCalled();
  expect(addMock).toHaveBeenCalledWith({ sale_id: sale.id, part_id: 1, qty: 2, unit_price: 5 });
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(sale);
});

// end-day POST
test('end session closes day', async () => {
  const session = { id: 4 };
  const endMock = jest.fn().mockResolvedValue(session);
  jest.unstable_mockModule('../services/posSessionsService.js', () => ({
    getActiveSession: jest.fn().mockResolvedValue(session),
    endSession: endMock,
  }));
  const { default: handler } = await import('../pages/api/epos/end-day.js');
  const req = { method: 'POST', body: { cash_total: 1, card_total: 2 }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(endMock).toHaveBeenCalledWith(session.id, { cash_total: 1, card_total: 2 });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(session);
});
