import { jest } from '@jest/globals';
import apiHandler from '../lib/apiHandler.js';

test('passes through successful handler', async () => {
  const fn = jest.fn(async (req, res) => {
    res.status(200).json({ ok: true });
  });
  const wrapped = apiHandler(fn);
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), headersSent: false };
  await wrapped({}, res);
  expect(fn).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ ok: true });
});

test('catches errors and responds with 500', async () => {
  const err = new Error('fail');
  const fn = jest.fn(() => { throw err; });
  const wrapped = apiHandler(fn);
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), headersSent: false };
  jest.spyOn(console, 'error').mockImplementation(() => {});
  await wrapped({}, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  console.error.mockRestore();
});
