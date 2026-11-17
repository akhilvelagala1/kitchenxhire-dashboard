import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, beforeEach } from 'vitest';
import { RecruiterSessionProvider } from '../layout/RecruiterSessionProvider';
import { writeRecruiterSession } from '../lib/recruiterSession';
import { RecruiterMyApplicationsPage } from './RecruiterMyApplicationsPage';

function renderPage() {
  return render(
    <RecruiterSessionProvider>
      <MemoryRouter initialEntries={['/recruiter/applications']}>
        <RecruiterMyApplicationsPage />
      </MemoryRouter>
    </RecruiterSessionProvider>
  );
}

describe('RecruiterMyApplicationsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    writeRecruiterSession({ phone: '9876543210' });
  });

  it('renders My Applications dashboard heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'My Applications' })).toBeInTheDocument();
    expect(screen.getByText(/Manage candidates who have applied/i)).toBeInTheDocument();
    expect(screen.getByText('Jobs in the Market')).toBeInTheDocument();
  });

  it('renders the five summary cards as pressed toggle buttons with Total Applications active by default', () => {
    renderPage();

    expect(screen.getByRole('button', { name: /Jobs Posted$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Total Applications$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hired \/ Accepted$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rejected \/ Declined$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Under Review$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Total Applications$/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('filters the applications table to only under-review rows when the Under Review card is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /Under Review$/ }));

    const table = screen.getByRole('table');
    expect(within(table).getAllByText('Under Review').length).toBeGreaterThan(0);
    expect(within(table).queryByText('Accepted')).not.toBeInTheDocument();
    expect(within(table).queryByText('Rejected')).not.toBeInTheDocument();
  });

  it('keeps the Under Review card and its matching status pill pressed together, and resets both when Total Applications is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    const totalCard = () => screen.getByRole('button', { name: /Total Applications$/ });
    const underReviewCard = () => screen.getByRole('button', { name: /Under Review$/ });
    const allPill = () => screen.getByRole('button', { name: /^All Applications \(\d+\)$/ });
    const underReviewPill = () => screen.getByRole('button', { name: /^Under Review \(\d+\)$/ });

    expect(totalCard()).toHaveAttribute('aria-pressed', 'true');
    expect(allPill()).toHaveClass('bg-brand-600');

    await user.click(underReviewCard());

    expect(underReviewCard()).toHaveAttribute('aria-pressed', 'true');
    expect(underReviewPill()).toHaveClass('bg-brand-600');
    expect(totalCard()).toHaveAttribute('aria-pressed', 'false');
    expect(allPill()).not.toHaveClass('bg-brand-600');

    await user.click(totalCard());

    expect(totalCard()).toHaveAttribute('aria-pressed', 'true');
    expect(allPill()).toHaveClass('bg-brand-600');
    expect(underReviewCard()).toHaveAttribute('aria-pressed', 'false');
    expect(underReviewPill()).not.toHaveClass('bg-brand-600');
  });

  it('replaces the applications table and filter bar with the jobs table when the Jobs Posted card is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /Jobs Posted$/ }));

    expect(screen.getByRole('columnheader', { name: 'Applicants' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Posted On' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Candidate' })).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Search by candidate name, job title...')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Under Review \(\d+\)$/ })
    ).not.toBeInTheDocument();
  });

  it('restores the applications table and filter bar with previously typed search text when leaving the Jobs Posted view', async () => {
    const user = userEvent.setup();
    renderPage();

    const searchInput = screen.getByPlaceholderText('Search by candidate name, job title...');
    await user.type(searchInput, 'ramesh');
    expect(searchInput).toHaveValue('ramesh');

    await user.click(screen.getByRole('button', { name: /Jobs Posted$/ }));
    expect(
      screen.queryByPlaceholderText('Search by candidate name, job title...')
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Rejected \/ Declined$/ }));

    expect(screen.getByPlaceholderText('Search by candidate name, job title...')).toHaveValue(
      'ramesh'
    );
    expect(screen.getByRole('button', { name: /^Rejected \(\d+\)$/ })).toHaveClass('bg-brand-600');
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  describe('Jobs Posted search and pagination', () => {
    it('shows a search input above the jobs table when Jobs Posted is active', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /Jobs Posted$/ }));

      expect(screen.getByPlaceholderText('Search job title...')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('filters the jobs table to only matching rows when typing a job title', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /Jobs Posted$/ }));
      await user.type(screen.getByPlaceholderText('Search job title...'), 'Tandoor');

      const table = screen.getByRole('table');
      expect(within(table).getByText('Tandoor Chef')).toBeInTheDocument();
      expect(within(table).queryByText('Cook / Chef')).not.toBeInTheDocument();
      expect(within(table).queryByText('Kitchen Helper')).not.toBeInTheDocument();
    });

    it('shows the "No jobs match your search" message when the search has no matches', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /Jobs Posted$/ }));
      await user.type(screen.getByPlaceholderText('Search job title...'), 'zzznomatch');

      expect(screen.getByText('No jobs match your search')).toBeInTheDocument();
      expect(
        screen.getByText('Try a different job title, or clear the search to see all posted jobs.')
      ).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('restores the full jobs list when the search is cleared', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /Jobs Posted$/ }));
      const searchInput = screen.getByPlaceholderText('Search job title...');
      await user.type(searchInput, 'Tandoor');

      const filteredTable = screen.getByRole('table');
      expect(within(filteredTable).queryByText('Cook / Chef')).not.toBeInTheDocument();

      await user.clear(searchInput);

      const restoredTable = screen.getByRole('table');
      expect(within(restoredTable).getByText('Cook / Chef')).toBeInTheDocument();
      expect(screen.getByText('Showing 1–5 of 12 jobs')).toBeInTheDocument();
    });

    it('shows a "Showing X-Y of Z jobs" footer with page controls and paginates to the next page', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /Jobs Posted$/ }));

      expect(screen.getByText('Showing 1–5 of 12 jobs')).toBeInTheDocument();
      const table = screen.getByRole('table');
      expect(within(table).getByText('Cook / Chef')).toBeInTheDocument();
      expect(within(table).queryByText('South Indian Cook')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(screen.getByText('Showing 6–10 of 12 jobs')).toBeInTheDocument();
      const tableAfterNext = screen.getByRole('table');
      expect(within(tableAfterNext).getByText('South Indian Cook')).toBeInTheDocument();
      expect(within(tableAfterNext).queryByText('Cook / Chef')).not.toBeInTheDocument();
    });

    it('places the jobs table and its "Showing" footer in the same card', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /Jobs Posted$/ }));

      const table = screen.getByRole('table');
      const showingText = screen.getByText(/^Showing \d+–\d+ of \d+ jobs$/);
      const card = table.closest('div.rounded-2xl');
      expect(card).not.toBeNull();
      expect(card).toContainElement(showingText);
    });
  });

  it('places the applications table and its "Showing" footer in the same card for the default Total Applications view', () => {
    renderPage();

    const table = screen.getByRole('table');
    const showingText = screen.getByText(/^Showing \d+–\d+ of \d+ applications$/);
    const card = table.closest('div.rounded-2xl');
    expect(card).not.toBeNull();
    expect(card).toContainElement(showingText);
  });
});
