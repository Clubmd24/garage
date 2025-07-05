/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

 test('edit page populates form with old quote data', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '1' }, push: jest.fn() }),
  }));
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, customer_id: 1, fleet_id: null, vehicle_id: null, customer_reference: null, po_number: null }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, first_name: 'A', last_name: 'B' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => [] });

  const { default: EditPage } = await import('../pages/office/quotations/[id]/edit.js');
  render(<EditPage />);

  await screen.findByDisplayValue('A B');
  expect(screen.getByText('Update Quote')).toBeInTheDocument();
});
