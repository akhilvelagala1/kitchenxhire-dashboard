import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Job } from '../schemas/home';
import { JobCard } from './JobCard';

const JOB: Job = {
  id: 'south-indian-cook',
  title: 'South Indian Cook',
  type: 'Full-time',
  place: 'Restaurant',
  area: 'Hitech City, Hyderabad',
  shift: 'Day Shift (9:00 AM – 6:00 PM)',
  pay: '₹22,000 – ₹28,000 / month',
  searchText: 'south indian cook restaurant hitech city hyderabad day shift full-time'
};

describe('JobCard', () => {
  it('opens the job when any part of the card is clicked, not just the "View Job" text', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<JobCard job={JOB} onOpen={onOpen} />);

    await user.click(screen.getByText('Hitech City, Hyderabad'));

    expect(onOpen).toHaveBeenCalledWith(JOB);
  });

  it('opens the job with the keyboard via Enter and Space', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<JobCard job={JOB} onOpen={onOpen} />);

    const cardEl = screen.getByRole('button', { name: 'View Job: South Indian Cook' });
    cardEl.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it('has a single interactive element — no nested button duplicating the same action', () => {
    render(<JobCard job={JOB} onOpen={vi.fn()} />);

    expect(screen.getAllByRole('button', { name: /View Job/i })).toHaveLength(1);
  });
});
