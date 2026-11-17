import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { renderPage } from '@/shared/test/render';
import { toast } from '@/shared/ui/toast';
import { adminApplicationsApi } from '../api/adminApplicationsApi';
import { adminApplicationsKeys } from '../api/adminApplicationsKeys';
import type { HireAdminApplication } from '../schemas/adminApplication';
import { ScheduleInterviewDialog } from './ScheduleInterviewDialog';

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

const application = (over: Partial<HireAdminApplication> = {}): HireAdminApplication => ({
  application_id: 'APP10892',
  candidate_id: 'CAN001',
  candidate_name: 'Rahul Kumar',
  candidate_email: 'rahul@example.com',
  candidate_phone: '+91 98765 43210',
  candidate_location: 'Hyderabad, TS',
  job_id: 'JOB10293',
  job_title: 'Cook / Chef',
  job_type: 'Full-time',
  recruiter_id: 'REC001',
  recruiter_name: 'Rahul Verma',
  outlet_name: 'Spice Bowl Restaurant',
  location: 'Hyderabad',
  applied_at: '2026-06-24T10:24:00+05:30',
  status: 'reviewed',
  interview_at: null,
  resume_file_name: null,
  ...over
});

const LIST_QUERY = { page: 1, page_size: 5 };

/** A mounted list, so a test can see that a successful write makes it load again. */
function ListProbe() {
  useQuery({
    queryKey: adminApplicationsKeys.list(LIST_QUERY),
    queryFn: () => adminApplicationsApi.list(LIST_QUERY)
  });
  return null;
}

function renderDialog(over: Partial<HireAdminApplication> = {}) {
  const onClose = vi.fn();
  renderPage(
    <>
      <ScheduleInterviewDialog application={application(over)} open onClose={onClose} />
      <ListProbe />
    </>
  );
  return onClose;
}

function typeDate(value: string) {
  fireEvent.change(screen.getByLabelText(/Interview date and time/), { target: { value } });
}

beforeEach(() => {
  vi.resetAllMocks();
  api.list.mockResolvedValue({ items: [], meta: { page: 1, page_size: 5, total: 0 } });
  api.post.mockResolvedValue(application({ status: 'interview_scheduled' }));
});

describe('ScheduleInterviewDialog', () => {
  it('names the candidate and the job', () => {
    renderDialog();

    const dialog = screen.getByRole('dialog', { name: 'Schedule interview' });
    expect(dialog).toHaveTextContent('Rahul Kumar');
    expect(dialog).toHaveTextContent('Cook / Chef');
  });

  it('shows the current interview time when one is already booked', () => {
    renderDialog({ interview_at: '2026-07-01T14:00:00+05:30' });

    expect(screen.getByText(/Currently scheduled for 1 Jul 2026, 02:00 PM/)).toBeInTheDocument();
  });

  it('asks for a date and time and sends nothing when the box is empty', async () => {
    const onClose = renderDialog();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Schedule interview' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Pick a date and time');
    expect(screen.getByLabelText(/Interview date and time/)).toBeInvalid();
    expect(api.post).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('sends the typed time as India time, then closes, says so and reloads the list', async () => {
    const onClose = renderDialog();
    const user = userEvent.setup();
    await vi.waitFor(() => expect(api.list).toHaveBeenCalledTimes(1));

    typeDate('2026-07-01T10:30');
    await user.click(screen.getByRole('button', { name: 'Schedule interview' }));

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/hire/admin/applications/APP10892/interview', {
      interview_at: '2026-07-01T10:30:00+05:30'
    });
    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Interview scheduled');
    expect(api.list).toHaveBeenCalledTimes(2);
  });

  it('clears the message once a date is typed', async () => {
    renderDialog();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Schedule interview' }));
    await screen.findByRole('alert');

    typeDate('2026-07-01T10:30');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('closes without sending when Cancel is pressed', async () => {
    const onClose = renderDialog();
    const user = userEvent.setup();
    typeDate('2026-07-01T10:30');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('toasts the server message and stays open when the request fails', async () => {
    api.post.mockRejectedValue(
      new ApiError({ message: 'Interview time is in the past.', code: 'VALIDATION', status: 422 })
    );
    const onClose = renderDialog();
    const user = userEvent.setup();
    typeDate('2020-01-01T10:30');

    await user.click(screen.getByRole('button', { name: 'Schedule interview' }));

    await vi.waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Interview time is in the past.')
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
