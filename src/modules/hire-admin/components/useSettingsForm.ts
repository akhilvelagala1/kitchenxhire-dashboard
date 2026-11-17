import { useLayoutEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { ApiError } from '@/shared/api/errors';
import { useApiMutation } from '@/shared/api/useApiMutation';
import { usePermissions } from '@/shared/auth/usePermissions';
import { adminSettingsApi } from '../api/adminSettingsApi';
import { adminSettingsKeys } from '../api/adminSettingsKeys';
import { HIRE_ADMIN_PERMISSIONS } from '../permissions';
import {
  settingsFormSchema,
  toFormValues,
  type HireAdminSettings,
  type SettingsFormValues,
  type SettingsPatch
} from '../schemas/adminSettings';
import { normalizePhone } from './phone';

type SettingsForm = UseFormReturn<SettingsFormValues>;

interface SaveVars {
  values: SettingsFormValues;
  /** The settings the form was loaded from. The patch holds only what differs from them. */
  saved: HireAdminSettings;
}

interface UseSettingsFormResult {
  form: SettingsForm;
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

/** The logo upload went through, then the other changes were refused. */
class LogoSavedError extends Error {
  readonly failure: unknown;

  constructor(failure: unknown) {
    super('The logo was saved, but the other changes were not');
    this.name = 'LogoSavedError';
    this.failure = failure;
  }
}

/** Every setting except the logo, which has its own upload. */
const PATCH_FIELDS = Object.keys(settingsFormSchema.shape).filter(
  (name): name is keyof SettingsPatch => name !== 'logo_file'
);
const FORM_FIELDS = new Set<string>(Object.keys(settingsFormSchema.shape));
/** Names the API may use for a rejected logo. */
const LOGO_FIELD_ALIASES = new Set(['file', 'logo', 'logo_url']);

function isFormField(name: string): name is keyof SettingsFormValues {
  return FORM_FIELDS.has(name);
}

/** Only the fields the person changed. The phone is compared and sent as 10 digits. */
function buildPatch(values: SettingsFormValues, saved: HireAdminSettings): SettingsPatch {
  const before = toFormValues(saved);
  const read = (source: SettingsFormValues, name: keyof SettingsPatch) =>
    name === 'support_phone' ? normalizePhone(source.support_phone) : source[name];
  const patch: SettingsPatch = {};
  for (const name of PATCH_FIELDS) {
    const next = read(values, name);
    if (next !== read(before, name)) Object.assign(patch, { [name]: next });
  }
  return patch;
}

/**
 * Uploads a chosen logo, then sends the changed fields, and writes every answer into the cache.
 * Resolves with the latest settings, or null when there was nothing to send.
 */
async function persist(
  client: QueryClient,
  { values, saved }: SaveVars
): Promise<HireAdminSettings | null> {
  const patch = buildPatch(values, saved);
  let latest: HireAdminSettings | null = null;

  if (values.logo_file) {
    latest = await adminSettingsApi.uploadLogo(values.logo_file);
    client.setQueryData(adminSettingsKeys.all, latest);
  }
  if (Object.keys(patch).length > 0) {
    try {
      latest = await adminSettingsApi.update(patch);
    } catch (error) {
      throw latest ? new LogoSavedError(error) : error;
    }
    client.setQueryData(adminSettingsKeys.all, latest);
  }
  return latest;
}

/** The API's messages go onto the inputs they name (CS-06). Unknown names are left to the toast. */
function showFieldErrors(form: SettingsForm, error: ApiError) {
  for (const [field, message] of Object.entries(error.fieldErrors)) {
    const name = LOGO_FIELD_ALIASES.has(field) ? 'logo_file' : field;
    if (isFormField(name)) form.setError(name, { message });
  }
}

/** The form stays as the person left it, except a logo that is already saved is not sent twice. */
function showFailure(form: SettingsForm, error: Error) {
  if (error instanceof LogoSavedError) {
    form.setValue('logo_file', null, { shouldDirty: true });
  }
  const cause = error instanceof LogoSavedError ? error.failure : error;
  if (cause instanceof ApiError) showFieldErrors(form, cause);
}

/**
 * The state behind the Settings page: the saved settings, the form that edits them, and Save and Reset.
 * The form loads once when the settings first arrive and again after a save, so a refetch
 * never replaces what the person is typing.
 */
export function useSettingsForm(): UseSettingsFormResult {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const canEdit = can(HIRE_ADMIN_PERMISSIONS.manage);
  const query = useQuery({
    queryKey: adminSettingsKeys.all,
    queryFn: adminSettingsApi.get,
    refetchOnWindowFocus: false,
    staleTime: Infinity
  });
  const settings = query.data;
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    mode: 'onChange'
  });
  const { isDirty } = form.formState;

  const loaded = useRef(false);
  useLayoutEffect(() => {
    if (!settings || loaded.current) return;
    loaded.current = true;
    form.reset(toFormValues(settings));
  }, [settings, form]);

  const mutation = useApiMutation({
    mutationFn: (vars: SaveVars) => persist(queryClient, vars),
    // persist() writes each response into the settings cache, so nothing is left stale.
    invalidates: [],
    successMessage: (result) => (result ? 'Settings saved' : 'No changes to save'),
    onSuccess: (result, vars) => form.reset(toFormValues(result ?? vars.saved))
  });

  const save = () => {
    if (!settings || !canEdit || mutation.isPending) return;
    const submit = form.handleSubmit((values) => {
      mutation.mutate({ values, saved: settings }, { onError: (err) => showFailure(form, err) });
    });
    void submit();
  };

  const reset = () => {
    if (settings) form.reset(toFormValues(settings));
  };

  return {
    form,
    settings,
    isLoading: query.isLoading,
    error: query.error,
    refetch: () => {
      void query.refetch();
    },
    canEdit,
    isDirty,
    isSaving: mutation.isPending,
    save,
    reset
  };
}
