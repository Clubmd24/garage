/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('job purchase orders page posts grouped orders', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '3' }, push: jest.fn() })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [
      { id: 1, part_number: 'A', description: 'a', supplier_id: 5 },
      { id: 2, part_number: 'B', description: 'b', supplier_id: 6 }
    ] })
    .mockResolvedValueOnce({ ok: true, json: async () => [
      { id: 5, name: 'S1' },
      { id: 6, name: 'S2' }
    ] })
    .mockResolvedValue({ ok: true, json: async () => ({}) });

  const { default: Page } = await import('../pages/office/jobs/[id]/purchase-orders.js');
  render(<Page />);

  await screen.findByText('Job #3 Parts');

  fireEvent.click(screen.getByLabelText('A - a'));
  fireEvent.click(screen.getByLabelText('B - b'));
  fireEvent.click(screen.getByText('Send Purchase Order'));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(4));
  expect(global.fetch.mock.calls[2][0]).toBe('/api/purchase-orders');
  expect(global.fetch.mock.calls[3][0]).toBe('/api/purchase-orders');
});

test('request supplier quote updates job status', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '4' }, push: jest.fn() })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValue({ ok: true, json: async () => ({}) });

  const { default: Page } = await import('../pages/office/jobs/[id]/purchase-orders.js');
  render(<Page />);

  await screen.findByText('Job #4 Parts');
  fireEvent.click(screen.getByText('Request Supplier Quote'));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
  expect(global.fetch.mock.calls[2][0]).toBe('/api/jobs/4');
  expect(global.fetch.mock.calls[2][1].method).toBe('PUT');
});
