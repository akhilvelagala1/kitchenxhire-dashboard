import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import type { HireAdminRecruiter } from '../schemas/adminRecruiter';
import { AdminRecruiterFormPage } from './AdminRecruiterFormPage';

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
const URL = '/hire/admin/recruiters/REC10892';

const recruiter = (over: Partial<HireAdminRecruiter> = {}): HireAdminRecruiter => ({
  recruiter_id: 'REC10892',
  business_name: 'Spice Bowl Restaurant',
  business_type: 'Restaurant',
  area: 'Rajiv Nagar',
  city: 'Hyderabad',
  owner_name: 'Rahul Verma',
  phone: '9876543210',
  email: 'rahul@spicebowl.example.com',
  outlets: 12,
  open_jobs: 48,
  applications: 24,
  status: 'active',
  verification: 'verified',
  joined_at: '2024-06-24T10:24:00+05:30',
  last_login_at: '2024-06-24T10:24:00+05:30',
  ...over
});

function Where() {
  return <p>Now at {useLocation().pathname}</p>;
}

function renderForm(edit = false) {
  return renderPage(
    <Routes>
      <Route path="/admin/recruiters/create" element={<AdminRecruiterFormPage />} />
      <Route path="/admin/recruiters/:recruiterId/edit" element={<AdminRecruiterFormPage />} />
      <Route path="*" element={<Where />} />
    </Routes>,
    { route: edit ? '/admin/recruiters/REC10892/edit' : '/admin/recruiters/create' }
  );
}

async function fillCreate(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Business name/), 'Urban Bites');
  await user.selectOptions(screen.getByLabelText(/Business type/), 'Cloud Kitchen');
  await user.type(screen.getByLabelText(/Area/), 'Banjara Hills');
  await user.clear(screen.getByLabelText(/City/));
  await user.type(screen.getByLabelText(/City/), 'Hyderabad');
  await user.type(screen.getByLabelText(/Owner name/), 'Anita Rao');
  await user.type(screen.getByLabelText(/Phone/), '+91 98765 43210');
  await user.type(screen.getByLabelText(/E-mail/), 'anita@urbanbites.example.com');
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('AdminRecruiterFormPage', () => {
  it('shows the empty add form with labelled fields and the right input types', () => {
    renderForm();

    expect(screen.getByRole('heading', { name: 'Add recruiter' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Business name/)).toHaveValue('');
    expect(screen.getByLabelText(/Phone/)).toHaveAttribute('type', 'tel');
    expect(screen.getByLabelText(/Phone/)).toHaveAttribute('autocomplete', 'tel');
    expect(screen.getByLabelText(/E-mail/)).toHaveAttribute('type', 'email');
    expect(screen.getByRole('link', { name: 'Back to Recruiter Management' })).toHaveAttribute(
      'href',
      '/admin/recruiters'
    );
  });

  it('shows an inline error for every empty required field and sends nothing', async () => {
    renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Add recruiter' }));

    expect(
      await screen.findByText('Business name must have at least 2 characters')
    ).toBeInTheDocument();
    expect(screen.getByText('Owner name must have at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Phone is required')).toBeInTheDocument();
    expect(screen.getByText('E-mail is required')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('rejects a phone number and an e-mail address in the wrong shape', async () => {
    renderForm();
    const user = userEvent.setup();
    await fillCreate(user);
    await user.clear(screen.getByLabelText(/Phone/));
    await user.type(screen.getByLabelText(/Phone/), '12345');
    await user.clear(screen.getByLabelText(/E-mail/));
    await user.type(screen.getByLabelText(/E-mail/), 'not-an-email');

    await user.click(screen.getByRole('button', { name: 'Add recruiter' }));

    expect(await screen.findByText('Enter a 10-digit mobile number')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid e-mail address')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('creates the recruiter with the typed values, says so and opens its page', async () => {
    api.post.mockResolvedValue(recruiter({ recruiter_id: 'REC10893' }));
    renderForm();
    const user = userEvent.setup();
    await fillCreate(user);

    await user.click(screen.getByRole('button', { name: 'Add recruiter' }));

    await vi.waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    expect(api.post).toHaveBeenCalledWith(
      '/hire/admin/recruiters',
      {
        business_name: 'Urban Bites',
        business_type: 'Cloud Kitchen',
        area: 'Banjara Hills',
        city: 'Hyderabad',
        owner_name: 'Anita Rao',
        phone: '9876543210',
        email: 'anita@urbanbites.example.com'
      },
      expect.objectContaining({ idempotencyKey: expect.any(String) })
    );
    expect(await screen.findByText('Now at /admin/recruiters/REC10893')).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith('Recruiter added');
  });

  it('puts a server field error on the matching input and stays on the form', async () => {
    api.post.mockRejectedValue(
      new ApiError({
        message: 'Invalid',
        code: 'VALIDATION',
        status: 422,
        fieldErrors: { email: 'This e-mail is already registered' }
      })
    );
    renderForm();
    const user = userEvent.setup();
    await fillCreate(user);

    await user.click(screen.getByRole('button', { name: 'Add recruiter' }));

    expect(await screen.findByText('This e-mail is already registered')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Add recruiter' })).toBeInTheDocument();
  });

  it('goes back to the list from Cancel', async () => {
    renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByText('Now at /admin/recruiters')).toBeInTheDocument();
  });

  it('shows a spinner while the recruiter loads for editing', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderForm(true);

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('fills the edit form from the record and sends only the fields that changed', async () => {
    api.get.mockResolvedValue(recruiter());
    api.patch.mockResolvedValue(recruiter({ owner_name: 'Meera Rao' }));
    renderForm(true);
    const user = userEvent.setup();

    expect(await screen.findByRole('heading', { name: 'Edit recruiter' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Business name/)).toHaveValue('Spice Bowl Restaurant');
    expect(screen.getByLabelText(/Business type/)).toHaveValue('Restaurant');
    await user.clear(screen.getByLabelText(/Owner name/));
    await user.type(screen.getByLabelText(/Owner name/), 'Meera Rao');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await vi.waitFor(() => expect(api.patch).toHaveBeenCalledTimes(1));
    expect(api.patch).toHaveBeenCalledWith(URL, { owner_name: 'Meera Rao' });
    expect(await screen.findByText('Now at /admin/recruiters/REC10892')).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith('Recruiter saved');
  });

  it('sends no request when nothing was changed', async () => {
    api.get.mockResolvedValue(recruiter());
    renderForm(true);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Now at /admin/recruiters/REC10892')).toBeInTheDocument();
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('shows the error with a retry, not "not found", when the load fails', async () => {
    api.get.mockRejectedValue(
      new ApiError({ message: 'Server down', code: 'HTTP_ERROR', status: 500 })
    );
    renderForm(true);

    expect(await screen.findByText('Server down')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Recruiter not found' })).not.toBeInTheDocument();
  });

  it('shows Recruiter not found when the server says 404', async () => {
    api.get.mockRejectedValue(
      new ApiError({ message: 'Not found', code: 'NOT_FOUND', status: 404 })
    );
    renderForm(true);

    expect(await screen.findByRole('heading', { name: 'Recruiter not found' })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Business name/)).not.toBeInTheDocument();
  });
});
