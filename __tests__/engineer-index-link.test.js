/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('engineer portal links each job to detail page', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => [{ id: 3 }] });
  const { default: Page } = await import('../pages/engineer/index.js');
  render(<Page />);
  const link = await screen.findByRole('link', { name: 'Job #3' });
  expect(link).toHaveAttribute('href', '/engineer/jobs/3');
});
