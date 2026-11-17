import { screen, within } from '@testing-library/react';
import { renderPage } from '@/shared/test/render';
import type { AuditLogEntry } from '../schemas/adminSettingsAuditLogs';
import { SettingsAuditLogsCard } from './SettingsAuditLogsCard';

const list = vi.fn();
vi.mock('../api/adminSettingsAuditLogsApi', () => ({
  adminSettingsAuditLogsApi: { list: () => list() }
}));

const ENTRY: AuditLogEntry = {
  id: 'al-1',
  timestamp: '2025-06-24T10:24:00+05:30',
  user_name: 'Ramesh Kumar',
  action: 'Updated',
  module: 'Settings',
  resource: 'Platform Preferences',
  details: 'Updated platform preferences',
  ip_address: '192.168.1.12',
  result: 'Success'
};

beforeEach(() => {
  list.mockReset();
});

describe('SettingsAuditLogsCard', () => {
  it('shows a loading state while the query is pending', () => {
    list.mockReturnValue(new Promise(() => {}));
    renderPage(<SettingsAuditLogsCard />);

    expect(screen.queryByText(ENTRY.user_name)).not.toBeInTheDocument();
    // DataTable renders a header row plus 5 skeleton rows while isLoading/no data.
    expect(screen.getAllByRole('row')).toHaveLength(6);
  });

  it('shows the entry once loaded, with its user and action pill', async () => {
    list.mockResolvedValue({
      items: [ENTRY],
      meta: { page: 1, page_size: 25, total: 1 }
    });
    renderPage(<SettingsAuditLogsCard />);

    const userCell = await screen.findByText(ENTRY.user_name);
    const row = userCell.closest('tr')!;
    expect(within(row).getByText(ENTRY.action)).toBeInTheDocument();
  });

  it('has a search input', () => {
    list.mockReturnValue(new Promise(() => {}));
    renderPage(<SettingsAuditLogsCard />);

    expect(
      screen.getByPlaceholderText('Search by user, action or resource...')
    ).toBeInTheDocument();
  });

  it('has module and action filter dropdowns', () => {
    list.mockReturnValue(new Promise(() => {}));
    renderPage(<SettingsAuditLogsCard />);

    expect(screen.getByRole('combobox', { name: 'Module' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Action' })).toBeInTheDocument();
  });

  it('has an Export button', () => {
    list.mockReturnValue(new Promise(() => {}));
    renderPage(<SettingsAuditLogsCard />);

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });
});
