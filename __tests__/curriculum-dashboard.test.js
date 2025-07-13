/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('CurriculumDashboard displays source names', async () => {
  const fetchMock = jest
    .fn()
    .mockResolvedValueOnce({
      running: false,
      standards: [{ id: 1, code: 'STD1', source_name: 'Standard One' }]
    })
    .mockResolvedValueOnce({ questions: [] });

  jest.unstable_mockModule('../lib/api', () => ({
    fetchJSON: fetchMock
  }));

  const { default: CurriculumDashboard } = await import(
    '../components/office/CurriculumDashboard.jsx'
  );
  render(<CurriculumDashboard />);

  await screen.findByText('Standard One');
  expect(screen.getByText('Standard One')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'View Questions' }));
  await screen.findByText('Loading…');
  expect(screen.getByText('Loading…')).toBeInTheDocument();

  await screen.findByRole('heading', { name: 'Standard One' });
  expect(screen.getByRole('heading', { name: 'Standard One' })).toBeInTheDocument();
  await screen.findByText('No questions found for this standard.');
});
