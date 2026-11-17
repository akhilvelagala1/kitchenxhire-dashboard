import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, useFormContext } from 'react-hook-form';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { useCanEditSettings } from '../components/settingsEditContext';
import { SETTINGS_FIXTURE } from '../components/settingsFixture';
import {
  toFormValues,
  type HireAdminSettings,
  type SettingsFormValues
} from '../schemas/adminSettings';
import type { AuditLogEntry } from '../schemas/adminSettingsAuditLogs';
import type { SettingsIntegrations } from '../schemas/adminSettingsIntegrations';
import type { SettingsNotifications } from '../schemas/adminSettingsNotifications';
import type { SettingsSecurity } from '../schemas/adminSettingsSecurity';
import type { SettingsUsersRoles } from '../schemas/adminSettingsUsersRoles';
import { AdminSettingsPage } from './AdminSettingsPage';

interface SettingsState {
  settings: HireAdminSettings | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
  canEdit: boolean;
  isDirty: boolean;
  isSaving: boolean;
  save: () => void;
  reset: () => void;
}

interface UsersRolesState {
  draft: SettingsUsersRoles | undefined;
  actions: { draft: SettingsUsersRoles } | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
  canEdit: boolean;
  isDirty: boolean;
  isSaving: boolean;
  save: () => void;
  reset: () => void;
}

interface NotificationsState {
  draft: SettingsNotifications | undefined;
  actions: { draft: SettingsNotifications } | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
  canEdit: boolean;
  isDirty: boolean;
  isSaving: boolean;
  save: () => void;
  reset: () => void;
}

interface IntegrationsState {
  draft: SettingsIntegrations | undefined;
  actions: { draft: SettingsIntegrations } | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
  canEdit: boolean;
  isDirty: boolean;
  isSaving: boolean;
  save: () => void;
  reset: () => void;
}

interface SecurityState {
  draft: SettingsSecurity | undefined;
  actions: { draft: SettingsSecurity } | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
  canEdit: boolean;
  isDirty: boolean;
  isSaving: boolean;
  save: () => void;
  reset: () => void;
}

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn(), list: vi.fn() } }));

/* The hook has its own tests. Here it only has to hand the page a form and a state to draw. */
const hook = vi.hoisted(() => ({ state: {} as SettingsState }));
vi.mock('../components/useSettingsForm', () => ({
  useSettingsForm: () => {
    const form = useForm<SettingsFormValues>({ defaultValues: toFormValues(SETTINGS_FIXTURE) });
    return { form, ...hook.state };
  }
}));

const usersHook = vi.hoisted(() => ({ state: {} as UsersRolesState }));
vi.mock('../components/useUsersRolesSettings', () => ({
  useUsersRolesSettings: () => usersHook.state
}));

const notificationsHook = vi.hoisted(() => ({ state: {} as NotificationsState }));
vi.mock('../components/useNotificationsSettings', () => ({
  useNotificationsSettings: () => notificationsHook.state
}));

const integrationsHook = vi.hoisted(() => ({ state: {} as IntegrationsState }));
vi.mock('../components/useIntegrationsSettings', () => ({
  useIntegrationsSettings: () => integrationsHook.state
}));

const securityHook = vi.hoisted(() => ({ state: {} as SecurityState }));
vi.mock('../components/useSecuritySettings', () => ({
  useSecuritySettings: () => securityHook.state
}));

/* The four cards have their own tests; here they only show what the page gives them. */
vi.mock('../components/SettingsPlatformInfoCard', () => ({
  SettingsPlatformInfoCard: ({ logoUrl }: { logoUrl: string | null }) => (
    <section aria-label="Platform Information">{logoUrl ?? 'Built-in logo'}</section>
  )
}));
vi.mock('../components/SettingsPreferencesCard', () => ({
  SettingsPreferencesCard: () => (
    <section aria-label="Platform Preferences">
      {useCanEditSettings() ? 'Editable' : 'Read only'}
    </section>
  )
}));
vi.mock('../components/SettingsHiringCard', () => ({
  SettingsHiringCard: () => (
    <section aria-label="Hiring Configuration">
      {useFormContext<SettingsFormValues>().getValues('default_job_expiry_days')} days
    </section>
  )
}));
vi.mock('../components/SettingsSystemCard', () => ({
  SettingsSystemCard: () => <section aria-label="System & Data" />
}));
vi.mock('../components/SettingsHiringJobsPanel', () => ({
  SettingsHiringJobsPanel: () => (
    <>
      <section aria-label="Job Configuration" />
      <section aria-label="Application & Interview Workflow" />
      <section aria-label="Interview & Communication" />
      <section aria-label="Candidate & Job Preferences" />
    </>
  )
}));
vi.mock('../components/SettingsUsersRolesPanel', () => ({
  SettingsUsersRolesPanel: () => (
    <>
      <section aria-label="Users Management" />
      <section aria-label="Role Management" />
      <section aria-label="Permissions Matrix" />
      <section aria-label="Access & Security" />
    </>
  )
}));
vi.mock('../components/SettingsNotificationsPanel', () => ({
  SettingsNotificationsPanel: () => (
    <>
      <section aria-label="Notification Channels" />
      <section aria-label="Notification Events" />
      <section aria-label="Notification Template" />
      <section aria-label="Delivery Preferences" />
    </>
  )
}));
vi.mock('../components/SettingsIntegrationsPanel', () => ({
  SettingsIntegrationsPanel: () => (
    <>
      <section aria-label="Connected Integrations" />
      <section aria-label="Webhook" />
    </>
  )
}));
vi.mock('../components/SettingsSecurityPanel', () => ({
  SettingsSecurityPanel: () => (
    <>
      <section aria-label="Access & Authentication" />
      <section aria-label="Additional Security" />
    </>
  )
}));

const api = vi.mocked(apiClient);
const GENERAL_CARDS = [
  'Platform Information',
  'Platform Preferences',
  'Hiring Configuration',
  'System & Data'
];
const HIRING_CARDS = [
  'Job Configuration',
  'Application & Interview Workflow',
  'Interview & Communication',
  'Candidate & Job Preferences'
];
const USERS_CARDS = [
  'Users Management',
  'Role Management',
  'Permissions Matrix',
  'Access & Security'
];
const NOTIFICATIONS_CARDS = [
  'Notification Channels',
  'Notification Events',
  'Notification Template',
  'Delivery Preferences'
];
const INTEGRATIONS_CARDS = ['Connected Integrations', 'Webhook'];
const SECURITY_CARDS = ['Access & Authentication', 'Additional Security'];

const USERS_DRAFT = {
  users: [],
  roles: [],
  permissions: {
    manage_users: { Admin: true, Recruiter: false, User: false },
    manage_roles: { Admin: true, Recruiter: false, User: false },
    create_manage_jobs: { Admin: true, Recruiter: true, User: false },
    view_own_applications: { Admin: true, Recruiter: true, User: true },
    schedule_interviews: { Admin: true, Recruiter: true, User: false },
    view_platform_reports: { Admin: true, Recruiter: true, User: false }
  },
  two_factor_auth: true,
  session_timeout_minutes: 60,
  user_activity_logging: true,
  ip_access_restriction: false
} satisfies SettingsUsersRoles;

const NOTIFICATIONS_DRAFT = {
  channels: { email: true, sms: true, whatsapp: false, in_app: true, push: false },
  events: {
    new_job_application: true,
    interview_scheduled: true,
    interview_reminder: true,
    candidate_shortlisted: true,
    candidate_rejected: false,
    new_business_registration: true
  },
  templates: {
    new_job_application: {
      subject: 'New Job Application Received',
      message: 'A new job application has been received for {{job_title}} at {{business_name}}.'
    },
    interview_scheduled: {
      subject: 'Interview Scheduled',
      message: 'An interview has been scheduled for {{candidate_name}}.'
    },
    interview_reminder: {
      subject: 'Interview Reminder',
      message: 'This is a reminder for your upcoming interview.'
    },
    candidate_shortlisted: {
      subject: 'Congratulations! You are shortlisted',
      message: 'You have been shortlisted for {{job_title}}.'
    },
    candidate_rejected: {
      subject: 'Application Status Update',
      message: 'Your application status has been updated.'
    },
    new_business_registration: {
      subject: 'New Business Registration',
      message: 'A new business {{business_name}} has registered.'
    }
  },
  quiet_hours_start: '10:00 PM',
  quiet_hours_end: '07:00 AM',
  retry_attempts: 3,
  priority: 'High'
} satisfies SettingsNotifications;

const INTEGRATIONS_DRAFT = {
  integrations: {
    smtp: { status: 'connected', detail: '' },
    sms: { status: 'connected', detail: '' },
    whatsapp: { status: 'not_connected', detail: '' },
    google_calendar: { status: 'connected', detail: '' },
    google_maps: { status: 'connected', detail: '' }
  },
  webhook: {
    enabled: true,
    url: 'https://your-domain.com/webhook',
    events: {
      job_created: true,
      application_received: true,
      interview_scheduled: true,
      candidate_status_updated: true
    }
  }
} satisfies SettingsIntegrations;

const SECURITY_DRAFT = {
  two_factor_auth: true,
  password_policy: {
    min_length: 8,
    require_uppercase: true,
    require_number: true,
    require_symbol: false,
    expiry_days: 90,
    reuse_count: 3
  },
  session_timeout: '30 minutes',
  failed_login_attempts: '5 attempts',
  account_lock_duration: '15 minutes',
  ip_restriction: false
} satisfies SettingsSecurity;

function serve(permissions: string[] = ['*']) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    throw new Error(`unexpected get ${url}`);
  });
}

function show(overrides: Partial<SettingsState> = {}): SettingsState {
  hook.state = {
    settings: SETTINGS_FIXTURE,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    canEdit: true,
    isDirty: false,
    isSaving: false,
    save: vi.fn(),
    reset: vi.fn(),
    ...overrides
  };
  return hook.state;
}

function showUsers(overrides: Partial<UsersRolesState> = {}): UsersRolesState {
  usersHook.state = {
    draft: USERS_DRAFT,
    actions: { draft: USERS_DRAFT },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    canEdit: true,
    isDirty: false,
    isSaving: false,
    save: vi.fn(),
    reset: vi.fn(),
    ...overrides
  };
  return usersHook.state;
}

function showNotifications(overrides: Partial<NotificationsState> = {}): NotificationsState {
  notificationsHook.state = {
    draft: NOTIFICATIONS_DRAFT,
    actions: { draft: NOTIFICATIONS_DRAFT },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    canEdit: true,
    isDirty: false,
    isSaving: false,
    save: vi.fn(),
    reset: vi.fn(),
    ...overrides
  };
  return notificationsHook.state;
}

function showIntegrations(overrides: Partial<IntegrationsState> = {}): IntegrationsState {
  integrationsHook.state = {
    draft: INTEGRATIONS_DRAFT,
    actions: { draft: INTEGRATIONS_DRAFT },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    canEdit: true,
    isDirty: false,
    isSaving: false,
    save: vi.fn(),
    reset: vi.fn(),
    ...overrides
  };
  return integrationsHook.state;
}

function showSecurity(overrides: Partial<SecurityState> = {}): SecurityState {
  securityHook.state = {
    draft: SECURITY_DRAFT,
    actions: { draft: SECURITY_DRAFT },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    canEdit: true,
    isDirty: false,
    isSaving: false,
    save: vi.fn(),
    reset: vi.fn(),
    ...overrides
  };
  return securityHook.state;
}

/* Audit & Logs has no draft/save hook: SettingsAuditLogsCard queries adminSettingsAuditLogsApi
   directly, so this stubs the list response instead of a hook state. */
function showAudit(items: AuditLogEntry[] = [], total = 0) {
  api.list.mockResolvedValue({ items, meta: { page: 1, page_size: 25, total } });
}

beforeEach(() => {
  vi.resetAllMocks();
  serve();
  show();
  showUsers();
  showNotifications();
  showIntegrations();
  showSecurity();
  showAudit();
});

describe('AdminSettingsPage', () => {
  it('shows the title, the line under it, the section pills and the four cards', async () => {
    renderPage(<AdminSettingsPage />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Platform configuration for KitchenX Hiring.')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
    for (const name of GENERAL_CARDS) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
  });

  it('shows the Hiring & Jobs cards when the tab URL param is hiring', async () => {
    renderPage(<AdminSettingsPage />, { route: '/admin/settings?tab=hiring' });

    expect(await screen.findByRole('tab', { name: 'Hiring & Jobs' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    for (const name of HIRING_CARDS) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('region', { name: 'Platform Information' })).not.toBeInTheDocument();
  });

  it('shows the Users & Roles cards when the tab URL param is users', async () => {
    renderPage(<AdminSettingsPage />, { route: '/admin/settings?tab=users' });

    expect(await screen.findByRole('tab', { name: 'Users & Roles' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    for (const name of USERS_CARDS) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('region', { name: 'Platform Information' })).not.toBeInTheDocument();
  });

  it('shows the Notifications cards when the tab URL param is notifications', async () => {
    renderPage(<AdminSettingsPage />, { route: '/admin/settings?tab=notifications' });

    expect(await screen.findByRole('tab', { name: 'Notifications' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    for (const name of NOTIFICATIONS_CARDS) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('region', { name: 'Platform Information' })).not.toBeInTheDocument();
  });

  it('shows the Integrations cards when the tab URL param is integrations', async () => {
    renderPage(<AdminSettingsPage />, { route: '/admin/settings?tab=integrations' });

    expect(await screen.findByRole('tab', { name: 'Integrations' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    for (const name of INTEGRATIONS_CARDS) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('region', { name: 'Platform Information' })).not.toBeInTheDocument();
  });

  it('shows the Security cards when the tab URL param is security', async () => {
    renderPage(<AdminSettingsPage />, { route: '/admin/settings?tab=security' });

    expect(await screen.findByRole('tab', { name: 'Security' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    for (const name of SECURITY_CARDS) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('region', { name: 'Platform Information' })).not.toBeInTheDocument();
  });

  it('renders the Audit & Logs panel when tab is audit', async () => {
    renderPage(<AdminSettingsPage />, { route: '/admin/settings?tab=audit' });

    expect(await screen.findByRole('tab', { name: 'Audit & Logs' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(await screen.findByText('Audit Logs')).toBeVisible();
  });

  it('hands the saved logo and the shared form to the cards', async () => {
    show({ settings: { ...SETTINGS_FIXTURE, logo_url: '/uploads/kitchenx-logo.png' } });
    renderPage(<AdminSettingsPage />);

    expect(await screen.findByRole('region', { name: 'Platform Information' })).toHaveTextContent(
      '/uploads/kitchenx-logo.png'
    );
    expect(screen.getByRole('region', { name: 'Hiring Configuration' })).toHaveTextContent(
      '30 days'
    );
  });

  it('shows a loading status under the heading and no cards while the settings load', async () => {
    show({ settings: undefined, isLoading: true });
    renderPage(<AdminSettingsPage />);

    expect(await screen.findByRole('status')).toHaveTextContent('Loading settings');
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
  });

  it('shows an error with a Try again button that asks for the settings again', async () => {
    const state = show({ settings: undefined, error: new Error('boom') });
    renderPage(<AdminSettingsPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this data');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(state.refetch).toHaveBeenCalledTimes(1);
  });

  it('keeps Reset and Save Changes off until something has changed', async () => {
    renderPage(<AdminSettingsPage />);

    expect(await screen.findByRole('button', { name: 'Save Changes' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
  });

  it('saves from Save Changes and resets from Reset once something has changed', async () => {
    const state = show({ isDirty: true });
    renderPage(<AdminSettingsPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Save Changes' }));
    expect(state.save).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(state.reset).toHaveBeenCalledTimes(1);
  });

  it('shows Saving... and keeps both buttons off while the save runs', async () => {
    show({ isDirty: true, isSaving: true });
    renderPage(<AdminSettingsPage />);

    expect(await screen.findByRole('button', { name: /Saving\.\.\./ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
  });

  it('tells the cards they are read-only and hides Reset and Save Changes from someone who can only view', async () => {
    serve(['hire.admin.view']);
    show({ canEdit: false, isDirty: true });
    renderPage(<AdminSettingsPage />);

    expect(await screen.findByRole('region', { name: 'Platform Preferences' })).toHaveTextContent(
      'Read only'
    );
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/auth/me'));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument()
    );
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
  });

  it('tells the cards they are editable for someone who can manage', async () => {
    renderPage(<AdminSettingsPage />);

    expect(await screen.findByRole('region', { name: 'Platform Preferences' })).toHaveTextContent(
      'Editable'
    );
  });
});
