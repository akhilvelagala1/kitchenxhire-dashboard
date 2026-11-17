import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/shared/api/errors';
import { renderPage } from '@/shared/test/render';
import { adminJobsApi } from '../api/adminJobsApi';
import type { HireAdminJob } from '../schemas/adminJob';
import {
  JOB_CATEGORY_OPTIONS,
  JOB_CITY_OPTIONS,
  JOB_DEPARTMENT_OPTIONS,
  JOB_EMPLOYMENT_TYPE_OPTIONS,
  JOB_EXPERIENCE_OPTIONS,
  JOB_VISIBILITY_OPTIONS,
  JOB_WORK_LOCATION_OPTIONS,
  JOB_WORK_SHIFT_OPTIONS
} from '../schemas/adminJobPost';
import { JobPostForm } from './JobPostForm';

vi.mock('../api/adminJobsApi', () => ({ adminJobsApi: { create: vi.fn() } }));
vi.mock('@/shared/ui/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const create = vi.mocked(adminJobsApi.create);
type User = ReturnType<typeof userEvent.setup>;

const job = (status: HireAdminJob['status']): HireAdminJob => ({
  job_id: 'JOB1001',
  title: 'Sous Chef',
  recruiter_id: 'REC1',
  recruiter_name: 'Asha Rao',
  business_name: 'Spice Bowl',
  category: 'Kitchen',
  job_category_label: 'Cook / Chef',
  location: 'Hyderabad',
  applications_count: 0,
  recruited_count: 0,
  status,
  posted_at: '2026-06-24T10:24:00+05:30'
});

async function fillValid(user: User, salary = { min: '18000', max: '25000' }) {
  await user.type(screen.getByLabelText(/Job Title/), 'Sous Chef');
  await user.selectOptions(screen.getByLabelText(/Job Category/), JOB_CATEGORY_OPTIONS[0]!.value);
  await user.selectOptions(screen.getByLabelText(/Department/), JOB_DEPARTMENT_OPTIONS[0]!.value);
  await user.type(screen.getByLabelText(/Number of Openings/), '3');
  await user.selectOptions(screen.getByLabelText(/City/), JOB_CITY_OPTIONS[0]!.value);
  await user.selectOptions(
    screen.getByLabelText(/Work Location/),
    JOB_WORK_LOCATION_OPTIONS[0]!.value
  );
  await user.selectOptions(
    screen.getByLabelText(/Employment Type/),
    JOB_EMPLOYMENT_TYPE_OPTIONS[0]!.value
  );
  await user.type(screen.getByLabelText('Minimum salary'), salary.min);
  await user.type(screen.getByLabelText('Maximum salary'), salary.max);
  await user.selectOptions(screen.getByLabelText(/Work Shift/), JOB_WORK_SHIFT_OPTIONS[0]!.value);
  await user.selectOptions(
    screen.getByLabelText(/Experience Required/),
    JOB_EXPERIENCE_OPTIONS[0]!.value
  );
  await user.type(screen.getByLabelText(/Job Description/), 'Run the hot line at dinner.');
  await user.type(screen.getByLabelText(/Responsibilities/), 'Prepare mise en place daily.');
  await user.type(screen.getByLabelText(/Requirements/), 'Two years in a restaurant.');
  fireEvent.change(screen.getByLabelText(/Application Deadline/), {
    target: { value: '2999-12-31' }
  });
  await user.selectOptions(
    screen.getByLabelText(/Job Visibility/),
    JOB_VISIBILITY_OPTIONS[0]!.value
  );
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('JobPostForm', () => {
  it('shows an error for every required field on Publish and sends nothing', async () => {
    renderPage(<JobPostForm onSaved={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Publish Job' }));

    expect(await screen.findByText(/Enter the job title/)).toBeInTheDocument();
    expect(screen.getByText('Select the job category')).toBeInTheDocument();
    expect(screen.getByText('Enter the number of openings')).toBeInTheDocument();
    expect(screen.getByText('Select the city')).toBeInTheDocument();
    expect(screen.getByText('Select the application deadline')).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it('moves focus to the first invalid field after a failed Publish', async () => {
    renderPage(<JobPostForm onSaved={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Publish Job' }));

    await screen.findByText(/Enter the job title/);
    expect(screen.getByLabelText(/Job Title/)).toHaveFocus();
  });

  it('saves a draft that has only a title, then reports it saved', async () => {
    create.mockResolvedValue(job('draft'));
    const onSaved = vi.fn();
    renderPage(<JobPostForm onSaved={onSaved} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Job Title/), 'Sous Chef');
    await user.click(screen.getByRole('button', { name: 'Save as Draft' }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Sous Chef', status: 'draft', openings: null })
    );
  });

  it('still asks for a title when saving a draft', async () => {
    renderPage(<JobPostForm onSaved={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Save as Draft' }));

    expect(await screen.findByText(/Enter the job title/)).toBeInTheDocument();
    expect(screen.queryByText('Select the job category')).not.toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it('publishes a complete form as active with numeric salary and openings', async () => {
    create.mockResolvedValue(job('active'));
    const onSaved = vi.fn();
    renderPage(<JobPostForm onSaved={onSaved} />);
    const user = userEvent.setup();

    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Publish Job' }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Sous Chef',
        status: 'active',
        openings: 3,
        salary_min: 18000,
        salary_max: 25000,
        application_deadline: '2999-12-31'
      })
    );
  });

  it('blocks Publish when the maximum salary is below the minimum', async () => {
    renderPage(<JobPostForm onSaved={vi.fn()} />);
    const user = userEvent.setup();

    await fillValid(user, { min: '25000', max: '18000' });
    await user.click(screen.getByRole('button', { name: 'Publish Job' }));

    expect(
      await screen.findByText('Maximum salary must be at least the minimum')
    ).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it('puts a server field error on the matching input and stays on the form', async () => {
    create.mockRejectedValue(
      new ApiError({
        message: 'Invalid',
        code: 'VALIDATION',
        status: 422,
        fieldErrors: { title: 'A job with this title already exists' }
      })
    );
    const onSaved = vi.fn();
    renderPage(<JobPostForm onSaved={onSaved} />);
    const user = userEvent.setup();

    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Publish Job' }));

    expect(await screen.findByText('A job with this title already exists')).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
