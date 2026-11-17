import { render, screen } from '@testing-library/react';
import { JobSeekerStatusBadge } from './JobSeekerStatusBadge';

describe('JobSeekerStatusBadge', () => {
  it('shows Active as text in dark green on a green tint', () => {
    render(<JobSeekerStatusBadge status="active" />);

    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('bg-[#DCFCE7]', 'text-[#15803D]');
  });

  it('shows Inactive as text in dark grey on a grey tint', () => {
    render(<JobSeekerStatusBadge status="inactive" />);

    const badge = screen.getByText('Inactive');
    expect(badge).toHaveClass('bg-[#E9EDF2]', 'text-[#475569]');
  });

  it('shows Under Review and Suspended with their tones', () => {
    const { rerender } = render(<JobSeekerStatusBadge status="under_review" />);
    expect(screen.getByText('Under Review')).toHaveClass('bg-[#FEF3C7]', 'text-[#A16207]');

    rerender(<JobSeekerStatusBadge status="suspended" />);
    expect(screen.getByText('Suspended')).toHaveClass('bg-[#FEE2E2]', 'text-[#DC2626]');
  });

  it('keeps an extra class from the caller', () => {
    render(<JobSeekerStatusBadge status="active" className="ml-2" />);

    expect(screen.getByText('Active')).toHaveClass('ml-2');
  });
});
