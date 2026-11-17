import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { FIND_JOBS_CATALOG } from '../content/findJobsCatalog';
import { buildJobSeekerSessionForPhone, writeJobSeekerSession } from '../lib/jobSeekerSession';
import { filterFindJobs } from '../lib/findJobs';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import { JobSeekerSessionProvider } from '../layout/JobSeekerSessionProvider';
import { FIND_JOBS_PAGE_SIZE, SALARY_CEIL, SALARY_FLOOR } from '../schemas/findJobs';
import { FindJobsPage } from './FindJobsPage';

const hyderabadCount = filterFindJobs(FIND_JOBS_CATALOG, {
  role: '',
  city: 'Hyderabad',
  categories: [],
  types: [],
  shifts: [],
  experience: [],
  salaryMin: SALARY_FLOOR,
  salaryMax: SALARY_CEIL,
  datePosted: [],
  sort: 'relevant',
  page: 1
}).length;
const pageOneEnd = Math.min(FIND_JOBS_PAGE_SIZE, hyderabadCount);
const pageTwoStart = FIND_JOBS_PAGE_SIZE + 1;
const pageTwoEnd = Math.min(FIND_JOBS_PAGE_SIZE * 2, hyderabadCount);

function renderFindJobs(initial = '/user') {
  writeJobSeekerSession(buildJobSeekerSessionForPhone('+91 98765 43210'));
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <JobSeekerSessionProvider>
        <HomeStateProvider>
          <FindJobsPage />
        </HomeStateProvider>
      </JobSeekerSessionProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('FindJobsPage', () => {
  it('shows the find jobs hero and result count for Hyderabad', async () => {
    renderFindJobs();
    expect(
      await screen.findByRole('heading', { name: /Find kitchen and hospitality jobs/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Job results/i })).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${hyderabadCount} jobs found in`, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText('Hyderabad')).toHaveClass('text-brand-600');
    expect(
      screen.getByText(new RegExp(`Showing 1–${pageOneEnd} of ${hyderabadCount} jobs`, 'i'))
    ).toBeInTheDocument();
    expect(screen.getAllByRole('article').length).toBeLessThanOrEqual(FIND_JOBS_PAGE_SIZE);
  });

  it('updates the count when a job title search is submitted', async () => {
    const user = userEvent.setup();
    renderFindJobs();
    const title = screen.getByPlaceholderText(/Search job title/i);
    await user.clear(title);
    await user.type(title, 'South Indian');
    await user.click(screen.getByRole('button', { name: /search jobs/i }));
    expect(await screen.findByText(/jobs found in/i)).toBeInTheDocument();
    expect(
      screen.queryByText(new RegExp(`${hyderabadCount} jobs found`, 'i'))
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Showing \d+–\d+ of \d+ jobs/i)).toBeInTheDocument();
  });

  it('keeps pagination inside the results card and advances pages', async () => {
    const user = userEvent.setup();
    renderFindJobs();
    const results = await screen.findByRole('region', { name: /Job results/i });
    expect(results).toContainElement(
      screen.getByRole('navigation', { name: /Job results pages/i })
    );
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(
      await screen.findByText(
        new RegExp(`Showing ${pageTwoStart}–${pageTwoEnd} of ${hyderabadCount} jobs`, 'i')
      )
    ).toBeInTheDocument();
  });

  it('expands filter categories and narrows results with experience', async () => {
    const user = userEvent.setup();
    renderFindJobs();
    expect(screen.queryByLabelText('Restaurant Manager')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /View More Categories/i }));
    expect(screen.getByLabelText('Restaurant Manager')).toBeInTheDocument();
    expect(screen.getByLabelText('Fresher')).toBeInTheDocument();
    expect(screen.getByLabelText('Last 24 hours')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Fresher'));
    expect(await screen.findByText(/jobs found in/i)).toBeInTheDocument();
    expect(
      screen.queryByText(new RegExp(`${hyderabadCount} jobs found`, 'i'))
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Showing \d+–\d+ of \d+ jobs/i)).toBeInTheDocument();
  });
});
