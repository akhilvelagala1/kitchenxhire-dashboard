import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { renderPage } from '@/shared/test/render';
import { JobSeekerSessionProvider } from '../layout/JobSeekerSessionProvider';
import { RecruiterSessionProvider } from '../layout/RecruiterSessionProvider';
import { HomeLayout } from '../layout/HomeLayout';
import { HomePage } from './HomePage';

function renderHome() {
  return renderPage(
    <JobSeekerSessionProvider>
      <RecruiterSessionProvider>
        <Routes>
          <Route element={<HomeLayout />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </RecruiterSessionProvider>
    </JobSeekerSessionProvider>
  );
}

describe('HomePage', () => {
  it('shows the headline and every section of the prototype', () => {
    renderHome();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Good people.s*Stronger kitchens./
    );
    for (const name of [
      'Find work that fits your skills.',
      'Hiring for every food business.',
      'How KitchenX Hiring works.',
      'Recently posted jobs.',
      'Make the right match.',
      'Built around real kitchen work.'
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
  });

  it('filters the job list as the role is typed and shows an empty state', async () => {
    const user = userEvent.setup();
    renderHome();

    await user.type(screen.getByLabelText('Job title or skill'), 'barista');

    expect(screen.queryByRole('heading', { name: 'South Indian Cook' })).not.toBeInTheDocument();
    expect(screen.getByText(/No matching jobs for that role yet/)).toBeInTheDocument();
  });

  it('fills the search and narrows the jobs when a role card is picked', async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole('button', { name: /Bakery Staff/ }));

    expect(screen.getByLabelText('Job title or skill')).toHaveValue('bakery');
    expect(screen.getByRole('heading', { name: 'Bakery Assistant' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Kitchen Helper' })).not.toBeInTheDocument();
  });

  it('reveals six more roles when "View all roles" is pressed', async () => {
    const user = userEvent.setup();
    renderHome();
    const more = () => document.getElementById('moreRoles')!;

    expect(more()).not.toBeVisible();
    await user.click(screen.getByRole('button', { name: 'View all roles' }));

    expect(more()).toBeVisible();
    expect(within(more()).getAllByRole('button')).toHaveLength(6);
  });

  it('switches the how-it-works steps between job seekers and employers', async () => {
    const user = userEvent.setup();
    renderHome();

    expect(screen.getByRole('heading', { name: 'Create a Profile' })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'For Employers' }));

    expect(screen.getByRole('heading', { name: 'Post a Vacancy' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Create a Profile' })).not.toBeInTheDocument();
  });

  it('opens the job details dialog and closes it again', async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getAllByRole('button', { name: /View Job/ })[0]!);
    const dialog = screen.getByRole('dialog', { name: /job details/ });
    expect(within(dialog).getByText('₹22,000 – ₹28,000 / month')).toBeInTheDocument();

    await user.click(within(dialog).getAllByRole('button', { name: 'Close' }).at(-1)!);
    await waitFor(() =>
      expect(screen.queryByText(/Apply with your skills/)).not.toBeInTheDocument()
    );
  });

  it('puts the chosen city in the header and in the search field', async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole('button', { name: /Hyderabad/ }));
    await user.click(screen.getByRole('option', { name: 'Madhapur' }));

    expect(screen.getByLabelText('City or area')).toHaveValue('Madhapur');
    expect(screen.getByRole('heading', { name: 'Kitchen Helper' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'South Indian Cook' })).not.toBeInTheDocument();
  });

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );

    await user.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(screen.queryByLabelText('City')).not.toBeInTheDocument();
  });
});
