import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import type { Job } from '../schemas/home';
import { JobDialog } from './JobDialog';

const BASE_JOB: Job = {
  id: 'south-indian-cook',
  title: 'South Indian Cook',
  type: 'Full-time',
  place: 'Restaurant',
  area: 'Hitech City, Hyderabad',
  shift: 'Day Shift (9:00 AM – 6:00 PM)',
  pay: '₹22,000 – ₹28,000 / month',
  searchText: 'south indian cook restaurant hitech city hyderabad day shift full-time'
};

function renderDialog(job: Job | null) {
  return render(
    <HomeStateProvider>
      <JobDialog job={job} onClose={vi.fn()} />
    </HomeStateProvider>
  );
}

describe('JobDialog', () => {
  it('falls back to the generic line when no description is present', () => {
    renderDialog(BASE_JOB);

    expect(
      screen.getByText(
        'Apply with your skills, the area you can travel to, and the shift you can work.'
      )
    ).toBeInTheDocument();
  });

  it('shows the real description, responsibilities and skills when present', () => {
    renderDialog({
      ...BASE_JOB,
      description: 'We are looking for an experienced South Indian Cook.',
      responsibilities: ['Prepare South Indian dishes', 'Maintain hygiene standards'],
      skills: ['South Indian', 'Breakfast & Meals']
    });

    expect(
      screen.getByText('We are looking for an experienced South Indian Cook.')
    ).toBeInTheDocument();
    expect(screen.getByText('Key Responsibilities')).toBeInTheDocument();
    expect(screen.getByText('Prepare South Indian dishes')).toBeInTheDocument();
    expect(screen.getByText('Required Skills')).toBeInTheDocument();
    expect(screen.getByText('Breakfast & Meals')).toBeInTheDocument();
  });

  it('omits the responsibilities and skills sections when not present', () => {
    renderDialog(BASE_JOB);

    expect(screen.queryByText('Key Responsibilities')).not.toBeInTheDocument();
    expect(screen.queryByText('Required Skills')).not.toBeInTheDocument();
  });

  it('shows the Verified badge only when the job is verified', () => {
    renderDialog({ ...BASE_JOB, company: 'Spice Route Restaurants', verified: true });

    expect(screen.getByText('Spice Route Restaurants')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('omits the Verified badge when the job is not verified', () => {
    renderDialog({ ...BASE_JOB, company: 'Spice Route Restaurants', verified: false });

    expect(screen.queryByText('Verified')).not.toBeInTheDocument();
  });

  it('shows location, employment type, shift and salary as four info chips', () => {
    renderDialog(BASE_JOB);

    expect(screen.getByText('Hitech City, Hyderabad')).toBeInTheDocument();
    expect(screen.getByText('Full-time')).toBeInTheDocument();
    expect(screen.getByText('Day Shift (9:00 AM – 6:00 PM)')).toBeInTheDocument();
    expect(screen.getByText('₹22,000 – ₹28,000 / month')).toBeInTheDocument();
  });

  it('opens on the Job Details tab and switches to About Restaurant without closing', async () => {
    const user = userEvent.setup();
    renderDialog({ ...BASE_JOB, description: 'We are looking for an experienced cook.' });

    expect(screen.getByRole('tab', { name: 'Job Details' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByText('We are looking for an experienced cook.')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'About Restaurant' }));

    expect(screen.getByRole('tab', { name: 'About Restaurant' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(
      screen.getByText('Restaurant information is currently unavailable.')
    ).toBeInTheDocument();
    expect(screen.queryByText('We are looking for an experienced cook.')).not.toBeInTheDocument();
  });

  it('resets to the Job Details tab when a different job is shown', async () => {
    const user = userEvent.setup();
    const { rerender } = renderDialog(BASE_JOB);

    await user.click(screen.getByRole('tab', { name: 'About Restaurant' }));
    expect(screen.getByRole('tab', { name: 'About Restaurant' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    rerender(
      <HomeStateProvider>
        <JobDialog job={{ ...BASE_JOB, id: 'other-job', title: 'Line Cook' }} onClose={vi.fn()} />
      </HomeStateProvider>
    );

    expect(screen.getByRole('tab', { name: 'Job Details' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });
});
