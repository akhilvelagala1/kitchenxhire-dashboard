import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RecruiterJobStatusBadge } from './RecruiterJobStatusBadge';

describe('RecruiterJobStatusBadge', () => {
  it('renders the Active pill as a single element when status is "Active"', () => {
    render(<RecruiterJobStatusBadge status="Active" />);

    expect(screen.getAllByText('Active')).toHaveLength(1);
  });

  it('renders the Pending pill as a single element when status is "Pending"', () => {
    render(<RecruiterJobStatusBadge status="Pending" />);

    expect(screen.getAllByText('Pending')).toHaveLength(1);
  });

  it('renders the Closed pill as a single element when status is "Closed"', () => {
    render(<RecruiterJobStatusBadge status="Closed" />);

    expect(screen.getAllByText('Closed')).toHaveLength(1);
  });
});
