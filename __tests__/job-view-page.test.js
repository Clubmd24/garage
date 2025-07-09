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

test('job view page displays data from api', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '1' } })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, customer_id: 2, vehicle_id: 3, status: 'in progress', notes: 'x', assignments: [] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, first_name: 'A', last_name: 'B' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 3, licence_plate: 'XYZ' }) });

  const { default: Page } = await import('../pages/office/jobs/[id].js');
  render(<Page />);

  await screen.findByText('Job #1');
  expect(screen.getByText('A B')).toBeInTheDocument();
  expect(screen.getByText('XYZ')).toBeInTheDocument();
  expect(screen.getByText('in progress')).toBeInTheDocument();
});

test('job view page shows vehicle and quote details when provided', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '9' } })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 9,
        customer_id: 2,
        vehicle_id: 3,
        status: 'awaiting assessment',
        notes: '',
        assignments: [],
        vehicle: { id: 3, licence_plate: 'ABC', make: 'Ford', model: 'Fiesta', vin_number: 'VIN' },
        quote: {
          id: 7,
          defect_description: 'broken',
          items: [
            { id: 1, description: 'part', qty: 2, unit_price: 5, partNumber: 'P1' }
          ],
        },
      }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, first_name: 'A', last_name: 'B' }) });

  const { default: Page } = await import('../pages/office/jobs/[id].js');
  render(<Page />);

  await screen.findByText('Job #9');
  expect(screen.getByText('ABC')).toBeInTheDocument();
  expect(screen.getByText('Ford')).toBeInTheDocument();
  expect(screen.getByText('broken')).toBeInTheDocument();
  expect(screen.getByText('part')).toBeInTheDocument();
});
