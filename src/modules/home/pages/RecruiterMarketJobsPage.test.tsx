import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { FIND_JOBS_CATALOG } from '../content/findJobsCatalog';
import { HomeStateProvider } from '../layout/HomeStateProvider';
import { RecruiterSessionProvider } from '../layout/RecruiterSessionProvider';
import { filterFindJobs } from '../lib/findJobs';
import { writeRecruiterSession } from '../lib/recruiterSession';
import { FIND_JOBS_PAGE_SIZE, SALARY_CEIL, SALARY_FLOOR } from '../schemas/findJobs';
import { RecruiterMarketJobsPage } from './RecruiterMarketJobsPage';

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

function renderMarketJobs() {
  writeRecruiterSession({ phone: '9876543210' });
  return render(
    <MemoryRouter initialEntries={['/recruiter/market-jobs']}>
      <RecruiterSessionProvider>
        <HomeStateProvider>
          <RecruiterMarketJobsPage />
        </HomeStateProvider>
      </RecruiterSessionProvider>
    </MemoryRouter>
  );
}

describe('RecruiterMarketJobsPage', () => {
  it('shows the same find-jobs hero and catalog count as the job seeker browse', async () => {
    renderMarketJobs();
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
    expect(screen.getByRole('heading', { name: /Filter Jobs/i })).toBeInTheDocument();
  });
});
