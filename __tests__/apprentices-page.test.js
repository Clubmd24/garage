/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('shows ingest running status', async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ running: true }) });
  const { default: Page } = await import('../pages/office/apprentices/index.js');
  render(<Page />);
  await screen.findByText('Apprentices');
  expect(global.fetch).toHaveBeenCalledWith('/api/apprentices');
  expect(global.fetch).toHaveBeenCalledWith(
    `/api/standards/status?secret=${process.env.NEXT_PUBLIC_API_SECRET}`
  );
  expect(screen.getByText('Refreshing curriculum…')).toBeInTheDocument();
});

test('refresh button posts ingest and shows toast', async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ running: false }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ started: true }) });
  const { default: Page } = await import('../pages/office/apprentices/index.js');
  render(<Page />);
  const btn = await screen.findByRole('button', { name: 'Refresh Curriculum' });
  fireEvent.click(btn);
  expect(screen.getByRole('status')).toBeInTheDocument();
  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/standards/ingest?secret=${process.env.NEXT_PUBLIC_API_SECRET}`,
      { method: 'POST' }
    )
  );
  await screen.findByRole('alert');
  expect(screen.getByRole('alert').textContent).toMatch('Curriculum refresh started');
});
