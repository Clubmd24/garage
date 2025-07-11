/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => { jest.resetModules(); jest.clearAllMocks(); });

test('OfficeLayout includes link to new invoice', async () => {
  jest.unstable_mockModule('next/router', () => ({
    useRouter: () => ({ push: jest.fn() })
  }));
  jest.unstable_mockModule('../lib/search.js', () => ({
    fetchSearch: jest.fn().mockResolvedValue(null)
  }));
  jest.unstable_mockModule('../lib/logout.js', () => ({
    default: jest.fn().mockResolvedValue()
  }));

  const { default: OfficeLayout } = await import('../components/OfficeLayout.jsx');
  render(
    <OfficeLayout>
      <div>content</div>
    </OfficeLayout>
  );

  const link = screen.getByRole('link', { name: 'New Invoice' });
  expect(link).toHaveAttribute('href', '/office/invoices/new');
});
