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

test('new invoice page renders', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ push: jest.fn() })
  }));

  jest.unstable_mockModule('../lib/invoices', () => ({
    createInvoice: jest.fn().mockResolvedValue({ id: 1 })
  }));

  const { default: NewPage } = await import('../pages/office/invoices/new.js');
  render(<NewPage />);

  expect(screen.getByText('New Invoice')).toBeInTheDocument();
  expect(screen.getByText('Create Invoice')).toBeInTheDocument();
});
