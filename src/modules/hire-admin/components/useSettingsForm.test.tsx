import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { sessionKeys } from '@/shared/auth/sessionKeys';
import { toast } from '@/shared/ui/toast';
import { toFormValues, type HireAdminSettings, type SettingsPatch } from '../schemas/adminSettings';
import { SETTINGS_FIXTURE } from './settingsFixture';
import { useSettingsForm } from './useSettingsForm';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: vi.fn(), patch: vi.fn(), upload: vi.fn() }
}));
vi.mock('@/shared/ui/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const api = vi.mocked(apiClient);
const BASE = '/hire/admin/settings';
const NEW_LOGO = 'https://cdn.kitchenx.test/logo.png';
const BUSY = new ApiError({ message: 'The server is busy', code: 'HTTP_ERROR', status: 503 });

/** What the fake server has saved: PATCH and the logo upload change it, GET returns it. */
let server: HireAdminSettings;

function serve(permissions: string[] = ['*']) {
  server = { ...SETTINGS_FIXTURE };
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    if (url === BASE) return server;
    throw new Error(`unexpected get ${url}`);
  });
  api.patch.mockImplementation(async (_url: string, body: unknown) => {
    server = { ...server, ...(body as SettingsPatch) };
    return server;
  });
  api.upload.mockImplementation(async () => {
    server = { ...server, logo_url: NEW_LOGO };
    return server;
  });
}

function mount() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...renderHook(() => useSettingsForm(), { wrapper }) };
}

/** Mounts the hook and waits for the settings and for the permission check. */
async function mountLoaded() {
  const view = mount();
  await waitFor(() => expect(view.result.current.settings).toBeDefined());
  await waitFor(() => expect(view.result.current.canEdit).toBe(true));
  return view;
}

type Loaded = Awaited<ReturnType<typeof mountLoaded>>;

const logoFile = () => new File(['png'], 'logo.png', { type: 'image/png' });

function edit(view: Loaded, ...changes: Array<() => void>) {
  act(() => changes.forEach((change) => change()));
  return view;
}

function save(view: Loaded) {
  act(() => view.result.current.save());
}

beforeEach(() => {
  vi.resetAllMocks();
  serve();
});

describe('useSettingsForm', () => {
  it('loads the saved settings into the form and starts with nothing changed', async () => {
    const { result } = await mountLoaded();

    expect(result.current.form.getValues()).toEqual(toFormValues(SETTINGS_FIXTURE));
    expect(result.current.settings).toEqual(SETTINGS_FIXTURE);
    expect(result.current.isDirty).toBe(false);
    expect(api.get).toHaveBeenCalledWith(BASE);
  });

  it('marks the form as changed when a field is edited', async () => {
    const view = await mountLoaded();

    edit(view, () =>
      view.result.current.form.setValue('platform_name', 'KitchenX Careers', { shouldDirty: true })
    );

    expect(view.result.current.isDirty).toBe(true);
  });

  it('brings the saved values back and drops a chosen logo on reset', async () => {
    const view = await mountLoaded();
    const { form } = view.result.current;
    edit(
      view,
      () => form.setValue('platform_name', 'KitchenX Careers', { shouldDirty: true }),
      () => form.setValue('logo_file', logoFile(), { shouldDirty: true })
    );

    act(() => view.result.current.reset());

    expect(form.getValues()).toEqual(toFormValues(SETTINGS_FIXTURE));
    expect(view.result.current.isDirty).toBe(false);
  });

  it('sends only the changed fields and reports success after the API answers', async () => {
    const view = await mountLoaded();
    edit(view, () =>
      view.result.current.form.setValue('default_job_expiry_days', 45, { shouldDirty: true })
    );

    save(view);
    await waitFor(() => expect(view.result.current.isDirty).toBe(false));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith(BASE, { default_job_expiry_days: 45 });
    expect(api.upload).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Settings saved');
    expect(view.result.current.settings?.default_job_expiry_days).toBe(45);
    expect(view.result.current.form.getValues('default_job_expiry_days')).toBe(45);
  });

  it.each([
    ['+91 98123 45678', '9812345678'],
    ['', '']
  ])('sends a support phone typed as "%s" as "%s"', async (typed, sent) => {
    const view = await mountLoaded();
    edit(view, () =>
      view.result.current.form.setValue('support_phone', typed, { shouldDirty: true })
    );

    save(view);
    await waitFor(() => expect(view.result.current.isDirty).toBe(false));

    expect(api.patch).toHaveBeenCalledWith(BASE, { support_phone: sent });
  });

  it('sends nothing when the phone only differs in how it is written', async () => {
    const view = await mountLoaded();
    edit(view, () =>
      view.result.current.form.setValue('support_phone', '+91 98785 43210', { shouldDirty: true })
    );

    save(view);
    await waitFor(() => expect(view.result.current.isDirty).toBe(false));

    expect(api.patch).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('No changes to save');
    expect(view.result.current.form.getValues('support_phone')).toBe('9878543210');
  });

  it('uploads a chosen logo first and then sends the other changed fields', async () => {
    const view = await mountLoaded();
    const logo = logoFile();
    const { form } = view.result.current;
    edit(
      view,
      () => form.setValue('logo_file', logo, { shouldDirty: true }),
      () => form.setValue('platform_name', 'KitchenX Careers', { shouldDirty: true })
    );

    save(view);
    await waitFor(() => expect(view.result.current.isDirty).toBe(false));

    expect(api.upload).toHaveBeenCalledWith(`${BASE}/logo`, logo);
    expect(api.patch).toHaveBeenCalledWith(BASE, { platform_name: 'KitchenX Careers' });
    expect(api.upload.mock.invocationCallOrder[0]).toBeLessThan(
      api.patch.mock.invocationCallOrder[0]!
    );
    expect(view.result.current.settings?.logo_url).toBe(NEW_LOGO);
    expect(form.getValues('logo_file')).toBeNull();
  });

  it('saves a logo on its own without sending an empty update', async () => {
    const view = await mountLoaded();
    edit(view, () =>
      view.result.current.form.setValue('logo_file', logoFile(), { shouldDirty: true })
    );

    save(view);
    await waitFor(() => expect(view.result.current.isDirty).toBe(false));

    expect(api.upload).toHaveBeenCalledTimes(1);
    expect(api.patch).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Settings saved');
    expect(view.result.current.settings?.logo_url).toBe(NEW_LOGO);
  });

  it('keeps the changes and shows the error when the save fails', async () => {
    api.patch.mockRejectedValue(BUSY);
    const view = await mountLoaded();
    edit(view, () =>
      view.result.current.form.setValue('default_job_expiry_days', 45, { shouldDirty: true })
    );

    save(view);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('The server is busy'));
    await waitFor(() => expect(view.result.current.isSaving).toBe(false));

    expect(toast.success).not.toHaveBeenCalled();
    expect(view.result.current.isDirty).toBe(true);
    expect(view.result.current.form.getValues('default_job_expiry_days')).toBe(45);
  });

  it('puts the API message on the field it names when a value is rejected', async () => {
    api.patch.mockRejectedValue(
      new ApiError({
        message: 'Some values are not valid',
        code: 'VALIDATION_ERROR',
        status: 422,
        fieldErrors: { support_email: 'This email is already used', not_a_field: 'ignored' }
      })
    );
    const view = await mountLoaded();
    edit(view, () =>
      view.result.current.form.setValue('support_email', 'sales@kitchenx.com', {
        shouldDirty: true
      })
    );

    save(view);
    await waitFor(() =>
      expect(view.result.current.form.getFieldState('support_email').error?.message).toBe(
        'This email is already used'
      )
    );

    expect(toast.error).toHaveBeenCalledWith('Some values are not valid');
    expect(view.result.current.isDirty).toBe(true);
  });

  it('says the logo was saved when the other changes were refused, and does not send it twice', async () => {
    api.patch.mockRejectedValueOnce(BUSY);
    const view = await mountLoaded();
    const { form } = view.result.current;
    edit(
      view,
      () => form.setValue('logo_file', logoFile(), { shouldDirty: true }),
      () => form.setValue('platform_name', 'KitchenX Careers', { shouldDirty: true })
    );

    save(view);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('The logo was saved, but the other changes were not')
    );
    await waitFor(() => expect(view.result.current.isSaving).toBe(false));

    expect(view.result.current.settings?.logo_url).toBe(NEW_LOGO);
    expect(view.result.current.isDirty).toBe(true);
    expect(form.getValues('logo_file')).toBeNull();

    save(view);
    await waitFor(() => expect(view.result.current.isDirty).toBe(false));

    expect(api.upload).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledTimes(2);
  });

  it('does not call the API and shows a message when a value is not valid', async () => {
    const view = await mountLoaded();
    edit(view, () =>
      view.result.current.form.setValue('support_email', 'not-an-email', { shouldDirty: true })
    );

    save(view);
    await waitFor(() =>
      expect(view.result.current.form.getFieldState('support_email').error?.message).toBe(
        'Enter a valid email address'
      )
    );

    expect(api.patch).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('allows editing for a person with hire.admin.manage', async () => {
    serve(['hire.admin.manage']);

    const { result } = await mountLoaded();

    expect(result.current.canEdit).toBe(true);
  });

  it('is read-only without hire.admin.manage and never calls the API to save', async () => {
    serve(['hire.admin.view']);
    const view = mount();
    await waitFor(() => expect(view.result.current.settings).toBeDefined());
    await waitFor(() => expect(view.client.getQueryState(sessionKeys.me)?.status).toBe('success'));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    edit(view, () =>
      view.result.current.form.setValue('platform_name', 'KitchenX Careers', { shouldDirty: true })
    );

    save(view);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(view.result.current.canEdit).toBe(false);
    expect(api.patch).not.toHaveBeenCalled();
    expect(api.upload).not.toHaveBeenCalled();
  });

  it('reports a failed load and loads the settings when it is retried', async () => {
    let attempts = 0;
    api.get.mockImplementation(async (url: string) => {
      if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions: ['*'] };
      attempts += 1;
      if (attempts === 1) throw new Error('Network down');
      return server;
    });
    const view = mount();
    expect(view.result.current.isLoading).toBe(true);

    await waitFor(() => expect(view.result.current.error).toBeTruthy());
    expect(view.result.current.settings).toBeUndefined();
    act(() => view.result.current.reset());
    act(() => view.result.current.refetch());
    await waitFor(() => expect(view.result.current.settings).toEqual(SETTINGS_FIXTURE));

    expect(view.result.current.error).toBeNull();
    expect(view.result.current.form.getValues()).toEqual(toFormValues(SETTINGS_FIXTURE));
  });
});
