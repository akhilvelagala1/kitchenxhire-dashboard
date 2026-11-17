import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { parseApplicationsSearchParams } from './applicationsPageParams';
import { ApplicationsToolbar } from './ApplicationsToolbar';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: vi.fn(), list: vi.fn(), post: vi.fn(), patch: vi.fn() }
}));

const api = vi.mocked(apiClient);

function renderToolbar(query = '', hasActiveFilters = false) {
  const onPatch = vi.fn();
  const onReset = vi.fn();
  renderPage(
    <ApplicationsToolbar
      params={parseApplicationsSearchParams(new URLSearchParams(query))}
      listQuery={{ page: 1, page_size: 5 }}
      hasActiveFilters={hasActiveFilters}
      resetKey={0}
      onPatch={onPatch}
      onReset={onReset}
    />
  );
  return { onPatch, onReset };
}

const dateButton = () => screen.getByRole('button', { name: 'Filter by applied date' });

beforeEach(() => {
  vi.resetAllMocks();
  api.get.mockResolvedValue({ user_id: 'u1', role: 'PLATFORM_ADMIN', permissions: ['*'] });
});

describe('ApplicationsToolbar date box', () => {
  it('shows only the calendar icon while no date is chosen', () => {
    renderToolbar();

    expect(dateButton()).toHaveTextContent('');
    expect(dateButton()).not.toHaveAttribute('title');
  });

  it('shows a short range such as 1 Jun – 24 Jun', () => {
    renderToolbar('from=2026-06-01&to=2026-06-24');

    expect(dateButton()).toHaveTextContent('1 Jun – 24 Jun');
    expect(dateButton()).toHaveAttribute('title', '1 Jun – 24 Jun');
  });

  it('says From when only the start is chosen', () => {
    renderToolbar('from=2026-06-01');
    expect(dateButton()).toHaveTextContent('From 1 Jun');
  });

  it('says Until when only the end is chosen', () => {
    renderToolbar('to=2026-06-24');
    expect(dateButton()).toHaveTextContent('Until 24 Jun');
  });

  it('shows a hand-typed date that is not a date as it is instead of failing', () => {
    renderToolbar('from=not-a-date');

    expect(dateButton()).toHaveTextContent('From not-a-date');
  });
});

describe('ApplicationsToolbar controls', () => {
  it('offers Clear filters only while a filter is active and reports the click', async () => {
    const { onReset } = renderToolbar('status=hired', true);

    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(onReset).toHaveBeenCalledOnce();
  });

  it('has no Clear filters button while nothing is filtered', () => {
    renderToolbar();

    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('lists All Status and the six statuses and removes the filter when All Status is picked', async () => {
    const { onPatch } = renderToolbar('status=hired', true);
    const status = screen.getByRole('combobox', { name: 'Filter by status' });

    expect(status).toHaveValue('hired');
    expect(
      screen.getAllByRole('option', {
        name: /^(All Status|Pending Review|Reviewed|Shortlisted|Interview Scheduled|Hired|Rejected)$/
      })
    ).toHaveLength(7);
    await userEvent.selectOptions(status, 'All Status');

    expect(onPatch).toHaveBeenCalledWith({ status: undefined });
  });

  it('shows the recruiter and location from the URL in their pickers', () => {
    renderToolbar('recruiter_id=REC1&recruiter_label=Rahul%20Verma&location=Hyderabad');

    expect(screen.getByRole('combobox', { name: 'Filter by recruiter' })).toHaveValue(
      'Rahul Verma'
    );
    expect(screen.getByRole('combobox', { name: 'Filter by location' })).toHaveValue('Hyderabad');
  });

  it('falls back to the id when a recruiter label is missing from the URL', () => {
    renderToolbar('recruiter_id=REC1');

    expect(screen.getByRole('combobox', { name: 'Filter by recruiter' })).toHaveValue('REC1');
  });
});
