import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecruiterPostJobForm } from './RecruiterPostJobForm';

const ACCOUNT_ID = '919876543210';
const VALID_DESCRIPTION =
  'Prepare meals, manage kitchen staff and maintain hygiene standards daily across all shifts.';

function renderPostJobForm() {
  return render(
    <MemoryRouter initialEntries={['/recruiter/post-job']}>
      <Routes>
        <Route
          path="/recruiter/post-job"
          element={<RecruiterPostJobForm accountId={ACCOUNT_ID} />}
        />
        <Route path="/recruiter" element={<div>Recruiter dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Job Title/i), 'Head Chef');
  await user.type(screen.getByLabelText(/Monthly Salary/i), '45000');
  await user.type(screen.getByLabelText(/Job Description/i), VALID_DESCRIPTION);
  await user.type(screen.getByLabelText(/Address \/ Work Location/i), 'Hitech City, Hyderabad');
}

function savedJobs() {
  const key = Array.from({ length: localStorage.length }, (_, index) =>
    localStorage.key(index)
  ).find((candidate) => candidate?.startsWith('kx-hire-recruiter-posted-jobs-v1:'));
  if (!key) return [];
  return JSON.parse(localStorage.getItem(key) ?? '[]') as {
    payload: { jobDescription: string; monthlySalary: number; sampleResume?: unknown };
  }[];
}

describe('RecruiterPostJobForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders no errors before the recruiter interacts and no resume upload', () => {
    const { container } = renderPostJobForm();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Job Title/i)).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText(/Job Description/i).tagName).toBe('TEXTAREA');
    expect(screen.queryByText(/Resume \(Optional\)/i)).not.toBeInTheDocument();
    expect(container.querySelectorAll('input[type="file"]')).toHaveLength(0);
  });

  it('shows inline errors, focuses the first invalid field and does not navigate on an empty submit', async () => {
    const user = userEvent.setup();
    renderPostJobForm();

    await user.click(screen.getByRole('button', { name: 'Post Job' }));

    expect(screen.getByText('Enter a job title.')).toBeInTheDocument();
    expect(screen.getByText('Enter the monthly salary.')).toBeInTheDocument();
    expect(
      screen.getByText('Job description is required (minimum 30 characters).')
    ).toBeInTheDocument();
    expect(screen.getByText('Enter the work location.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Title/i)).toHaveFocus();
    expect(screen.queryByText('Recruiter dashboard')).not.toBeInTheDocument();
  });

  it('clears the title error after the recruiter corrects the title', async () => {
    const user = userEvent.setup();
    renderPostJobForm();

    await user.click(screen.getByRole('button', { name: 'Post Job' }));
    expect(screen.getByText('Enter a job title.')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Job Title/i), 'Head Chef');

    expect(screen.queryByText('Enter a job title.')).not.toBeInTheDocument();
  });

  it('rejects a job description shorter than 30 characters and focuses it', async () => {
    const user = userEvent.setup();
    renderPostJobForm();

    await user.type(screen.getByLabelText(/Job Title/i), 'Head Chef');
    await user.type(screen.getByLabelText(/Monthly Salary/i), '45000');
    await user.type(screen.getByLabelText(/Address \/ Work Location/i), 'Hyderabad');
    await user.type(screen.getByLabelText(/Job Description/i), 'Too short');
    await user.click(screen.getByRole('button', { name: 'Post Job' }));

    expect(
      screen.getByText('Job description is required (minimum 30 characters).')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Description/i)).toHaveFocus();
  });

  it('rejects a non-numeric salary on blur', async () => {
    const user = userEvent.setup();
    renderPostJobForm();

    await user.type(screen.getByLabelText(/Monthly Salary/i), 'abc');
    await user.tab();

    expect(screen.getByText('Enter the salary in whole rupees (digits only).')).toBeInTheDocument();
  });

  it('rejects a salary of zero on blur', async () => {
    const user = userEvent.setup();
    renderPostJobForm();

    await user.type(screen.getByLabelText(/Monthly Salary/i), '0');
    await user.tab();

    expect(screen.getByText('Enter a valid amount greater than 0.')).toBeInTheDocument();
  });

  it('shows an age error when the maximum age is below the minimum', async () => {
    const user = userEvent.setup();
    renderPostJobForm();

    await user.selectOptions(screen.getByLabelText('Minimum age'), '40');
    await user.selectOptions(screen.getByLabelText('Maximum age'), '30');
    await user.tab();

    expect(screen.getByText('Maximum age must be at least the minimum age.')).toBeInTheDocument();
  });

  it('saves a valid job with the description and numeric salary, then navigates', async () => {
    const user = userEvent.setup();
    renderPostJobForm();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: 'Post Job' }));

    expect(await screen.findByText('Recruiter dashboard')).toBeInTheDocument();
    const jobs = savedJobs();
    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.payload.jobDescription).toBe(VALID_DESCRIPTION);
    expect(jobs[0]?.payload.monthlySalary).toBe(45000);
    expect('sampleResume' in (jobs[0]?.payload ?? {})).toBe(false);
  });

  it('shows a save error and stays on the form when localStorage rejects the write', async () => {
    const user = userEvent.setup();
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    renderPostJobForm();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: 'Post Job' }));

    expect(
      screen.getByText('Could not save this job on this device. Free some storage and try again.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Recruiter dashboard')).not.toBeInTheDocument();
  });

  it('keeps the age selects marked invalid while the age error is shown', async () => {
    const user = userEvent.setup();
    renderPostJobForm();

    await user.selectOptions(screen.getByLabelText('Minimum age'), '40');
    await user.selectOptions(screen.getByLabelText('Maximum age'), '30');
    fireEvent.blur(screen.getByLabelText('Maximum age'));

    expect(screen.getByLabelText('Minimum age')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Maximum age')).toHaveAttribute('aria-invalid', 'true');
  });
});
