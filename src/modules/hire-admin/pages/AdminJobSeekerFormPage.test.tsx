import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import type { HireAdminJobSeeker } from '../schemas/adminJobSeeker';
import { AdminJobSeekerFormPage } from './AdminJobSeekerFormPage';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    list: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn()
  }
}));
vi.mock('@/shared/ui/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const api = vi.mocked(apiClient);
const URL = '/hire/admin/job-seekers/JS12846';

const jobSeeker = (over: Partial<HireAdminJobSeeker> = {}): HireAdminJobSeeker => ({
  job_seeker_id: 'JS12846',
  name: 'Ramesh Kumar',
  email: 'ramesh.kumar@email.com',
  phone: '9876543210',
  city: 'Hyderabad',
  state: 'TS',
  preferred_job_title: 'Cook / Chef',
  experience_years: 3,
  profile_completion: 92,
  applications_count: 12,
  interviews_count: 4,
  shortlisted_count: 4,
  hired_count: 1,
  status: 'active',
  joined_at: '2026-06-22T10:24:00+05:30',
  last_active_at: '2026-06-24T10:24:00+05:30',
  ...over
});

function renderCreate() {
  return renderPage(<AdminJobSeekerFormPage />, {
    route: '/admin/job-seekers/create',
    path: '/admin/job-seekers/create'
  });
}

function renderEdit() {
  return renderPage(<AdminJobSeekerFormPage />, {
    route: '/admin/job-seekers/JS12846/edit',
    path: '/admin/job-seekers/:jobSeekerId/edit'
  });
}

function serveEdit(detail: () => Promise<HireAdminJobSeeker> = async () => jobSeeker()) {
  api.get.mockImplementation(async (url: string) => {
    if (url === URL) return detail();
    throw new Error(`unexpected get ${url}`);
  });
}

async function fillCreateForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Full name/), 'Priya Sharma');
  await user.type(screen.getByLabelText(/E-mail/), 'priya.sharma@email.com');
  await user.type(screen.getByLabelText(/Phone/), '+91 90000 11111');
  await user.type(screen.getByLabelText(/City/), 'Pune');
  await user.type(screen.getByLabelText(/Preferred job title/), 'Kitchen Helper');
  await user.clear(screen.getByLabelText(/Years of experience/));
  await user.type(screen.getByLabelText(/Years of experience/), '2');
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('AdminJobSeekerFormPage - add', () => {
  it('shows the add heading, the six labelled fields and a link back to the list', () => {
    renderCreate();

    expect(screen.getByRole('heading', { name: 'Add job seeker' })).toBeInTheDocument();
    for (const label of [
      /Full name/,
      /E-mail/,
      /Phone/,
      /City/,
      /Preferred job title/,
      /Years of experience/
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByLabelText(/E-mail/)).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(/Phone/)).toHaveAttribute('type', 'tel');
    expect(screen.getByLabelText(/Phone/)).toHaveAttribute('autocomplete', 'tel');
    expect(screen.getByRole('link', { name: 'Back to Job Seekers' })).toHaveAttribute(
      'href',
      '/admin/job-seekers'
    );
  });

  it('shows an inline error for each bad field and sends nothing', async () => {
    renderCreate();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/E-mail/), 'not-an-email');
    await user.type(screen.getByLabelText(/Phone/), 'abc');
    await user.clear(screen.getByLabelText(/Years of experience/));
    await user.type(screen.getByLabelText(/Years of experience/), '75');
    await user.click(screen.getByRole('button', { name: 'Add job seeker' }));

    expect(await screen.findByText(/Enter the full name/)).toBeInTheDocument();
    expect(screen.getByText('Enter a valid e-mail address')).toBeInTheDocument();
    expect(screen.getByText(/Enter a 10-digit mobile number/)).toBeInTheDocument();
    expect(screen.getByText('Enter the city')).toBeInTheDocument();
    expect(screen.getByText('Enter the preferred job title')).toBeInTheDocument();
    expect(screen.getByText('Experience cannot be more than 50 years')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('asks for a number when the experience is left empty', async () => {
    renderCreate();
    const user = userEvent.setup();

    await user.clear(screen.getByLabelText(/Years of experience/));
    await user.click(screen.getByRole('button', { name: 'Add job seeker' }));

    expect(
      await screen.findByText('Enter the years of experience as a number')
    ).toBeInTheDocument();
  });

  it('creates the job seeker with the typed values and a toast', async () => {
    api.post.mockResolvedValue(jobSeeker({ job_seeker_id: 'JS12847' }));
    renderCreate();
    const user = userEvent.setup();

    await fillCreateForm(user);
    await user.click(screen.getByRole('button', { name: 'Add job seeker' }));

    await vi.waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    expect(api.post).toHaveBeenCalledWith(
      '/hire/admin/job-seekers',
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '9000011111',
        city: 'Pune',
        preferred_job_title: 'Kitchen Helper',
        experience_years: 2
      },
      expect.objectContaining({ idempotencyKey: expect.any(String) })
    );
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Job seeker added'));
  });

  it('puts a server field error on the matching input', async () => {
    api.post.mockRejectedValue(
      new ApiError({
        message: 'Invalid',
        code: 'VALIDATION',
        status: 422,
        fieldErrors: { email: 'This e-mail is already used' }
      })
    );
    renderCreate();
    const user = userEvent.setup();

    await fillCreateForm(user);
    await user.click(screen.getByRole('button', { name: 'Add job seeker' }));

    expect(await screen.findByText('This e-mail is already used')).toBeInTheDocument();
  });
});

describe('AdminJobSeekerFormPage - edit', () => {
  it('shows a spinner while the record loads', () => {
    serveEdit(() => new Promise(() => {}));
    renderEdit();

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('fills the form with the saved values', async () => {
    serveEdit();
    renderEdit();

    expect(await screen.findByRole('heading', { name: 'Edit job seeker' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full name/)).toHaveValue('Ramesh Kumar');
    expect(screen.getByLabelText(/E-mail/)).toHaveValue('ramesh.kumar@email.com');
    expect(screen.getByLabelText(/City/)).toHaveValue('Hyderabad');
    expect(screen.getByLabelText(/Years of experience/)).toHaveValue(3);
    expect(screen.getByRole('link', { name: 'Back to job seeker' })).toHaveAttribute(
      'href',
      '/admin/job-seekers/JS12846'
    );
  });

  it('sends only the fields that changed', async () => {
    serveEdit();
    api.patch.mockResolvedValue(jobSeeker({ city: 'Pune', experience_years: 4 }));
    renderEdit();
    const user = userEvent.setup();

    const city = await screen.findByLabelText(/City/);
    await user.clear(city);
    await user.type(city, 'Pune');
    await user.clear(screen.getByLabelText(/Years of experience/));
    await user.type(screen.getByLabelText(/Years of experience/), '4');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await vi.waitFor(() => expect(api.patch).toHaveBeenCalledTimes(1));
    expect(api.patch).toHaveBeenCalledWith(URL, { city: 'Pune', experience_years: 4 });
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Job seeker saved'));
  });

  it('sends nothing when nothing changed', async () => {
    serveEdit();
    renderEdit();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Save changes' }));

    await vi.waitFor(() => expect(screen.queryByLabelText(/Full name/)).not.toBeInTheDocument());
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('shows the error with a retry, not "not found", when the server fails', async () => {
    serveEdit(async () => {
      throw new ApiError({ message: 'Server down', code: 'HTTP_ERROR', status: 500 });
    });
    renderEdit();

    expect(await screen.findByText('Server down')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Job seeker not found' })).not.toBeInTheDocument();
  });

  it('shows Job seeker not found when the server says 404', async () => {
    serveEdit(async () => {
      throw new ApiError({ message: 'Not found', code: 'NOT_FOUND', status: 404 });
    });
    renderEdit();

    expect(
      await screen.findByRole('heading', { name: 'Job seeker not found' })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Full name/)).not.toBeInTheDocument();
  });
});
