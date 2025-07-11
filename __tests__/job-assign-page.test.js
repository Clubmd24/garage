/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });


test('assign job form submits without scheduled end', async () => {
  const push = jest.fn();
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ query: { id: '5' }, push })
  }));
  jest.unstable_mockModule('../lib/engineers', () => ({
    fetchEngineers: jest.fn().mockResolvedValue([{ id: 2, username: 'E' }])
  }));
  jest.unstable_mockModule('../lib/jobs', () => ({
    fetchJob: jest.fn().mockResolvedValue({ id: 5 })
  }));

  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

  const { default: Page } = await import('../pages/office/jobs/assign.js');
  render(<Page />);

  await screen.findByText('Assign Engineer');
  fireEvent.change(screen.getByLabelText('Engineer'), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText('Scheduled Start'), { target: { value: '2024-01-01T09:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Assign' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  const body = JSON.parse(global.fetch.mock.calls[0][1].body);
  expect(body.scheduled_start).toBe('2024-01-01T09:00');
  expect(body.scheduled_end).toBeUndefined();
  expect(push).toHaveBeenCalledWith('/office/jobs/5');
});
