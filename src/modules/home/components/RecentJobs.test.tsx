import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Job } from '../schemas/home';
import { JOBS } from '../content/jobs';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import { RecentJobs } from './RecentJobs';

/** A fixed four-job set for tests that check card position/count, independent of JOBS content. */
const FIXTURE_JOBS: Job[] = [
  {
    id: 'south-indian-cook',
    title: 'South Indian Cook',
    type: 'Full-time',
    place: 'Restaurant',
    area: 'Hitech City, Hyderabad',
    shift: 'Day Shift (9:00 AM – 6:00 PM)',
    pay: '₹22,000 – ₹28,000 / month',
    searchText: 'south indian cook restaurant hitech city hyderabad day shift full-time chef'
  },
  {
    id: 'kitchen-helper',
    title: 'Kitchen Helper',
    type: 'Full-time',
    place: 'Cloud Kitchen',
    area: 'Madhapur, Hyderabad',
    shift: 'Rotational Shift (7:00 AM – 3:00 PM)',
    pay: '₹14,000 – ₹18,000 / month',
    searchText: 'kitchen helper cloud kitchen madhapur hyderabad rotational shift full-time'
  },
  {
    id: 'bakery-assistant',
    title: 'Bakery Assistant',
    type: 'Part-time',
    place: 'Bakery & Café',
    area: 'Banjara Hills, Hyderabad',
    shift: 'Evening Shift (4:00 PM – 10:00 PM)',
    pay: '₹10,000 – ₹14,000 / month',
    searchText: 'bakery assistant bakery cafe café banjara hills hyderabad evening shift part-time'
  },
  {
    id: 'cleaning-stewarding-staff',
    title: 'Cleaning & Stewarding Staff',
    type: 'Full-time',
    place: 'Hotel',
    area: 'Gachibowli, Hyderabad',
    shift: 'Day Shift (8:00 AM – 5:00 PM)',
    pay: '₹15,000 – ₹20,000 / month',
    searchText: 'cleaning stewarding staff hotel gachibowli hyderabad day shift full-time'
  }
];

/** Eight distinct jobs, used to exercise the "View more / View less" control (shows past six). */
const EIGHT_JOBS: Job[] = Array.from({ length: 8 }, (_, index) => ({
  id: `job-${index + 1}`,
  title: `Sample Role ${index + 1}`,
  type: 'Full-time',
  place: 'Restaurant',
  area: 'Hyderabad',
  shift: 'Day Shift (9:00 AM – 6:00 PM)',
  pay: '₹15,000 – ₹20,000 / month',
  searchText: `sample role ${index + 1} restaurant hyderabad full-time`
}));

function renderRecentJobs(props: Partial<Parameters<typeof RecentJobs>[0]> = {}) {
  const defaultProps = {
    jobs: JOBS,
    emptyMessage: 'No jobs match your search right now.',
    ...props
  };

  return render(
    <HomeStateProvider>
      <RecentJobs {...defaultProps} />
    </HomeStateProvider>
  );
}

describe('RecentJobs', () => {
  it('renders kicker, headline, and the View All Jobs control', () => {
    renderRecentJobs();

    expect(screen.getByText('Recent opportunities')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Recently posted jobs.' })
    ).toBeInTheDocument();

    const viewAllBtn = screen.getByRole('button', { name: 'View All Jobs →' });
    expect(viewAllBtn).toBeInTheDocument();
    expect(viewAllBtn.className).toContain('whitespace-nowrap');
  });

  it('shows first two cards on mobile and reveals remaining cards on tablet and desktop', () => {
    const { container } = renderRecentJobs({ jobs: FIXTURE_JOBS });

    const articles = container.querySelectorAll('article');
    expect(articles).toHaveLength(4);

    // Initial 2 jobs are visible on mobile
    expect(articles[0]?.className).not.toContain('hidden');
    expect(articles[1]?.className).not.toContain('hidden');

    // Jobs 3 and 4 are hidden on mobile (<720px) and visible from tablet up
    expect(articles[2]?.className).toContain('hidden min-[720px]:flex');
    expect(articles[3]?.className).toContain('hidden min-[720px]:flex');
  });

  it('shows only the first six cards, expanding and collapsing via View All Jobs', async () => {
    const user = userEvent.setup();
    const { container } = renderRecentJobs({ jobs: EIGHT_JOBS });

    expect(container.querySelectorAll('article')).toHaveLength(6);
    expect(screen.getByRole('heading', { name: 'Sample Role 6' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Sample Role 7' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'View All Jobs →' }));

    expect(container.querySelectorAll('article')).toHaveLength(8);
    expect(screen.getByRole('heading', { name: 'Sample Role 8' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'View Less' }));

    expect(container.querySelectorAll('article')).toHaveLength(6);
    expect(screen.queryByRole('heading', { name: 'Sample Role 7' })).not.toBeInTheDocument();
  });

  it('has no View All Jobs control when six or fewer jobs are passed', () => {
    renderRecentJobs({ jobs: FIXTURE_JOBS });

    expect(screen.queryByRole('button', { name: 'View All Jobs →' })).not.toBeInTheDocument();
  });

  it('resets back to collapsed when the job list changes', async () => {
    const user = userEvent.setup();
    const { rerender } = renderRecentJobs({ jobs: EIGHT_JOBS });

    await user.click(screen.getByRole('button', { name: 'View All Jobs →' }));
    expect(screen.getByRole('heading', { name: 'Sample Role 8' })).toBeInTheDocument();

    rerender(
      <HomeStateProvider>
        <RecentJobs jobs={FIXTURE_JOBS} emptyMessage="No jobs match your search right now." />
      </HomeStateProvider>
    );

    expect(screen.queryByRole('button', { name: 'View All Jobs →' })).not.toBeInTheDocument();
  });

  it('renders all four job cards with their details and badges', () => {
    renderRecentJobs({ jobs: FIXTURE_JOBS });

    // Verify card titles
    expect(
      screen.getByRole('heading', { level: 3, name: 'South Indian Cook' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Kitchen Helper' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Bakery Assistant' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Cleaning & Stewarding Staff' })
    ).toBeInTheDocument();

    // Verify metadata items
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Hitech City, Hyderabad')).toBeInTheDocument();
    expect(screen.getByText('Day Shift (9:00 AM – 6:00 PM)')).toBeInTheDocument();
    expect(screen.getByText('₹22,000 – ₹28,000 / month')).toBeInTheDocument();

    // Verify employment type badges
    const fullTimeBadges = screen.getAllByText('Full-time');
    expect(fullTimeBadges.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('Part-time')).toBeInTheDocument();

    // Verify accessible View Job buttons
    const viewJobButtons = screen.getAllByRole('button', { name: /View Job/i });
    expect(viewJobButtons).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'View Job: South Indian Cook' })).toBeInTheDocument();
  });

  it('opens JobDialog when View Job button is clicked and closes it via Close button', async () => {
    const user = userEvent.setup();
    renderRecentJobs({ jobs: FIXTURE_JOBS });

    const cookViewJobBtn = screen.getByRole('button', { name: 'View Job: South Indian Cook' });
    await user.click(cookViewJobBtn);

    const dialog = screen.getByRole('dialog', { name: /job details/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: 'South Indian Cook' })).toBeInTheDocument();
    expect(within(dialog).getByText('₹22,000 – ₹28,000 / month')).toBeInTheDocument();
    expect(within(dialog).getByText('Hitech City, Hyderabad')).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: /Apply Now/ })).toHaveAttribute('href', '#how');

    // Close dialog via the bottom Close button
    const closeButtons = within(dialog).getAllByRole('button', { name: 'Close' });
    expect(closeButtons).toHaveLength(2); // Top X button and bottom Close button
    await user.click(closeButtons[1]!);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /job details/i })).not.toBeInTheDocument();
    });
  });

  it('closes JobDialog via top X button', async () => {
    const user = userEvent.setup();
    renderRecentJobs({ jobs: FIXTURE_JOBS });

    const helperViewJobBtn = screen.getByRole('button', { name: 'View Job: Kitchen Helper' });
    await user.click(helperViewJobBtn);

    const dialog = screen.getByRole('dialog', { name: /job details/i });
    expect(dialog).toBeInTheDocument();

    // Close dialog via top X button
    const closeButtons = within(dialog).getAllByRole('button', { name: 'Close' });
    await user.click(closeButtons[0]!);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /job details/i })).not.toBeInTheDocument();
    });
  });

  it('renders the empty message when no jobs are present', () => {
    renderRecentJobs({
      jobs: [],
      emptyMessage: 'No jobs found for this location.'
    });

    expect(screen.getByText('No jobs found for this location.')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'South Indian Cook' })
    ).not.toBeInTheDocument();
  });
});
