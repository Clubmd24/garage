/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('approving quote with job updates existing job', async () => {
  const push = jest.fn();
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ push })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, customer_id: 1, total_amount: 10, status: 'new', job_id: 5 }] })
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValue({ ok: true, json: async () => ({}) });

  const { default: Page } = await import('../pages/office/quotations/index.js');
  render(<Page />);

  await screen.findByText('Quote #1');
  fireEvent.click(screen.getByText('Approve'));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(5));
  expect(global.fetch.mock.calls[3][0]).toBe('/api/jobs/5');
  expect(global.fetch.mock.calls[3][1].method).toBe('PUT');
  expect(global.fetch.mock.calls.some(c => c[0] === '/api/jobs' && c[1]?.method === 'POST')).toBe(false);
  expect(global.fetch.mock.calls[4][0]).toBe('/api/quotes/1');
});
