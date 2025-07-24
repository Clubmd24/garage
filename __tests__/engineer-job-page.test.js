/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('engineer job page loads job data', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '4' } })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, name: 'open' }] })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 4,
        status: 'open',
        vehicle: { licence_plate: 'XYZ' },
        quote: { defect_description: 'broken', items: [{ id: 1, description: 'part', qty: 2 }] },
        notes: 'n'
      })
    });

  const { default: Page } = await import('../pages/engineer/jobs/[id].js');
  render(<Page />);

  await screen.findByText('Job #4');
  expect(screen.getByText('XYZ')).toBeInTheDocument();
  expect(screen.getByText('broken')).toBeInTheDocument();
  expect(screen.getByText('part')).toBeInTheDocument();
});

test('mileage form posts update', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '5' } })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 5, vehicle_id: 2 }) })
    .mockResolvedValue({ ok: true, json: async () => ({}) });

  const { default: Page } = await import('../pages/engineer/jobs/[id].js');
  render(<Page />);
  await screen.findByText('Job #5');
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
  expect(global.fetch.mock.calls[2][0]).toBe('/api/vehicle-mileage');
});

test('status form updates job', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '6' } })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, name: 'open' }, { id: 2, name: 'done' }] })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 6, status: 'open' }) })
    .mockResolvedValue({ ok: true, json: async () => ({}) });

  const { default: Page } = await import('../pages/engineer/jobs/[id].js');
  render(<Page />);
  await screen.findByText('Job #6');
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'done' } });
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
  expect(global.fetch.mock.calls[2][0]).toBe('/api/jobs/6');
  expect(JSON.parse(global.fetch.mock.calls[2][1].body)).toEqual({ status: 'done' });
});

test('notes form updates notes', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '7' } })
  }));

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 7, notes: '' }) })
    .mockResolvedValue({ ok: true, json: async () => ({}) });

  const { default: Page } = await import('../pages/engineer/jobs/[id].js');
  render(<Page />);
  await screen.findByText('Job #7');
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'note' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Notes' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
  expect(global.fetch.mock.calls[2][0]).toBe('/api/jobs/7');
  expect(JSON.parse(global.fetch.mock.calls[2][1].body)).toEqual({ notes: 'note' });
});
