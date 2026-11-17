import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { downloadUrl } from '@/shared/lib/download';
import { renderPage } from '@/shared/test/render';
import { BusinessHeaderActions } from './BusinessHeaderActions';

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
vi.mock('@/shared/lib/download', () => ({ downloadUrl: vi.fn() }));

const api = vi.mocked(apiClient);
const BASE = '/hire/admin/businesses';

const EXPORT_JOB = {
  id: 'job-1',
  kind: 'EXPORT',
  status: 'SUCCEEDED',
  progress_percent: 100,
  dry_run: false,
  summary: null,
  result_url: 'https://files.example/businesses.csv',
  error_report_url: null,
  error_message: null
};

function serve(permissions: string[]) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    if (url === `/jobs/${EXPORT_JOB.id}`) return EXPORT_JOB;
    throw new Error(`unexpected get ${url}`);
  });
  api.post.mockResolvedValue(EXPORT_JOB);
}

beforeEach(() => {
  vi.resetAllMocks();
  serve(['hire.admin.view', 'hire.admin.manage']);
});

describe('BusinessHeaderActions', () => {
  it('shows Export and Add Business', async () => {
    renderPage(<BusinessHeaderActions onAddBusiness={() => undefined} />);

    expect(await screen.findByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Business' })).toBeInTheDocument();
  });

  it('hides both buttons without the manage permission', async () => {
    serve(['hire.admin.view']);
    renderPage(<BusinessHeaderActions onAddBusiness={() => undefined} />);

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/auth/me'));
    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Business' })).not.toBeInTheDocument();
  });

  it('exports the filtered view and downloads the file when it is ready', async () => {
    renderPage(<BusinessHeaderActions onAddBusiness={() => undefined} />, {
      route: '/?tab=active&search=spice'
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Export' }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        `${BASE}/exports`,
        expect.objectContaining({ tab: 'active', search: 'spice', business_ids: [] })
      )
    );
    await waitFor(() =>
      expect(downloadUrl).toHaveBeenCalledWith('https://files.example/businesses.csv')
    );
  });
});
