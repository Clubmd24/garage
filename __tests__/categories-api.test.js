import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

// GET /categories
test('categories index returns list of categories', async () => {
  const cats = [{ id: 1, name: 'A' }];
  const getAllMock = jest.fn().mockResolvedValue(cats);
  jest.unstable_mockModule('../services/categoriesService.js', () => ({
    getAllCategories: getAllMock,
    createCategory: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/categories/index.js');
  const req = { method: 'GET', headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(cats);
  expect(getAllMock).toHaveBeenCalledTimes(1);
});

// POST /categories
test('categories index creates category', async () => {
  const newCat = { id: 2, name: 'B' };
  const createMock = jest.fn().mockResolvedValue(newCat);
  jest.unstable_mockModule('../services/categoriesService.js', () => ({
    getAllCategories: jest.fn(),
    createCategory: createMock,
  }));
  const { default: handler } = await import('../pages/api/categories/index.js');
  const req = { method: 'POST', body: { name: 'B' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(newCat);
  expect(createMock).toHaveBeenCalledWith(req.body);
});

// GET /categories/[id]
test('category detail returns category by id', async () => {
  const cat = { id: 3, name: 'C' };
  const getMock = jest.fn().mockResolvedValue(cat);
  jest.unstable_mockModule('../services/categoriesService.js', () => ({
    getCategoryById: getMock,
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/categories/[id].js');
  const req = { method: 'GET', query: { id: '3' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(cat);
  expect(getMock).toHaveBeenCalledWith('3');
});

// PUT /categories/[id]
test('category update returns ok', async () => {
  const updateMock = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/categoriesService.js', () => ({
    getCategoryById: jest.fn(),
    updateCategory: updateMock,
    deleteCategory: jest.fn(),
  }));
  const { default: handler } = await import('../pages/api/categories/[id].js');
  const req = { method: 'PUT', query: { id: '4' }, body: { name: 'New' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ ok: true });
  expect(updateMock).toHaveBeenCalledWith('4', req.body);
});

// DELETE /categories/[id]
test('category delete succeeds', async () => {
  const deleteMock = jest.fn().mockResolvedValue({ ok: true });
  jest.unstable_mockModule('../services/categoriesService.js', () => ({
    getCategoryById: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: deleteMock,
  }));
  const { default: handler } = await import('../pages/api/categories/[id].js');
  const req = { method: 'DELETE', query: { id: '5' }, headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.end).toHaveBeenCalled();
  expect(deleteMock).toHaveBeenCalledWith('5');
});
