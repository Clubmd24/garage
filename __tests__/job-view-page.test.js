/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 5, username: 'E' }] })
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, name: 'in progress' }] })
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
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 5, username: 'E' }] })
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, name: 'awaiting assessment' }] })
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

test('job view page updates job status and assignment', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '5' } })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, username: 'E' }] })
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, name: 'unassigned' }, { id: 2, name: 'in progress' }] })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 5, status: 'unassigned', assignments: [] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 5, status: 'in progress', assignments: [{ user_id: 2 }] }) });

  const { default: Page } = await import('../pages/office/jobs/[id].js');
  render(<Page />);

  await screen.findByText('Job #5');
  fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'in progress' } });
  fireEvent.change(screen.getByLabelText('Engineer'), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText('Scheduled Start'), { target: { value: '2024-01-01T10:00' } });
  fireEvent.change(screen.getByLabelText('Scheduled End'), { target: { value: '2024-01-01T11:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(6));
  expect(global.fetch.mock.calls[3][0]).toBe('/api/jobs/5/assign');
  expect(global.fetch.mock.calls[4][0]).toBe('/api/jobs/5');
  expect(global.fetch.mock.calls[4][1].method).toBe('PUT');
});
