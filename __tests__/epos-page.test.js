/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

function setupFetch() {
  global.fetch = jest.fn((url) => {
    if (url === '/api/epos/start-day') return Promise.resolve({ ok: true, json: async () => ({ id: 1 }) });
    if (url === '/api/categories') return Promise.resolve({ ok: true, json: async () => [{ id: 1, name: 'Cat' }] });
    if (url === '/api/parts') return Promise.resolve({ ok: true, json: async () => [{ id: 1, description: 'Part', unit_cost: 10, category_id: 1 }] });
    if (url === '/api/epos/sales') return Promise.resolve({ ok: true, json: async () => ({ id: 9 }) });
    if (url === '/api/invoices') return Promise.resolve({ ok: true, json: async () => ({ id: 5 }) });
    if (url === '/api/invoices/5/pdf') return Promise.resolve({ ok: true, blob: async () => new Blob(['pdf']) });
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
}

test('take payment button shows modal', async () => {
  setupFetch();
  const { default: Page } = await import('../pages/office/epos/index.js');
  render(<Page />);
  await screen.findByText('Part');
  fireEvent.click(screen.getByRole('button', { name: 'Take Payment' }));
  expect(await screen.findByTestId('payment-modal')).toBeInTheDocument();
  expect(global.fetch.mock.calls.find(c => c[0] === '/api/epos/sales')).toBeUndefined();
});

test('confirm cash payment posts sale', async () => {
  setupFetch();
  const { default: Page } = await import('../pages/office/epos/index.js');
  render(<Page />);
  const partBtn = await screen.findByText('Part');
  fireEvent.click(partBtn);
  fireEvent.click(screen.getByRole('button', { name: 'Take Payment' }));
  const modal = await screen.findByTestId('payment-modal');
  fireEvent.change(screen.getByLabelText('€50 notes'), { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  await waitFor(() => expect(global.fetch.mock.calls.some(c => c[0] === '/api/epos/sales')).toBe(true));
  const body = JSON.parse(global.fetch.mock.calls.find(c => c[0] === '/api/epos/sales')[1].body);
  expect(body.payment_type).toBe('cash');
  expect(body.total_amount).toBe(10);
});

test('invoice created and printed without alert', async () => {
  setupFetch();
  window.open = jest.fn(() => ({ print: jest.fn() }));
  global.alert = jest.fn();
  const { default: Page } = await import('../pages/office/epos/index.js');
  render(<Page />);
  const partBtn = await screen.findByText('Part');
  fireEvent.click(partBtn);
  fireEvent.click(screen.getByRole('button', { name: 'Take Payment' }));
  fireEvent.change(screen.getByLabelText('€50 notes'), { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  await waitFor(() => expect(global.fetch.mock.calls.some(c => c[0] === '/api/invoices')).toBe(true));
  expect(global.fetch.mock.calls.some(c => c[0] === '/api/invoices/5/pdf')).toBe(true);
  expect(window.open).toHaveBeenCalledWith('/api/invoices/5/pdf');
  expect(global.alert).not.toHaveBeenCalled();
});
