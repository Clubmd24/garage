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
      standards: [
        {
          id: 1,
          code: 'STD1',
          source_name: 'Standard One',
          source_url: 'http://example.com/std1.pdf',
          generated_questions: 1,
          target_questions: 2
        }
      ]
    })
    .mockResolvedValueOnce({
      questions: [
        { no: 1, text: 'Q1', options: ['A', 'B'], answer_index: 1 }
      ]
    });

  jest.unstable_mockModule('../lib/api', () => ({
    fetchJSON: fetchMock
  }));

  const { default: CurriculumDashboard } = await import(
    '../components/office/CurriculumDashboard.jsx'
  );
  render(<CurriculumDashboard />);

  await screen.findByText('Standard One');
  expect(screen.getByText('Standard One')).toBeInTheDocument();
  const link = screen.getByRole('link', { name: 'PDF' });
  expect(link).toHaveAttribute('href', 'http://example.com/std1.pdf');
  expect(screen.getByText('1 / 2')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'View Questions' }));
  await screen.findByText('Loading…');
  expect(screen.getByText('Loading…')).toBeInTheDocument();

  await screen.findByRole('heading', { name: 'Standard One' });
  expect(screen.getByRole('heading', { name: 'Standard One' })).toBeInTheDocument();
  await screen.findByText('Q1');
  expect(screen.getByText('✓ B')).toBeInTheDocument();
});
