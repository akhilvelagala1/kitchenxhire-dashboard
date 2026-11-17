import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Unlink } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import {
  SETTINGS_INTEGRATION_META,
  settingsIntegrationFormSchema,
  type SettingsIntegrationFormValues,
  type SettingsIntegrationKey
} from '../schemas/adminSettingsIntegrations';
import { useIntegrationsSettingsDraft } from './integrationsSettingsContext';

const DETAIL_LABEL: Record<SettingsIntegrationKey, string> = {
  smtp: 'From address',
  sms: 'Sender ID',
  whatsapp: 'Business number',
  google_calendar: 'Calendar account',
  google_maps: 'API key label'
};

function Body({
  integrationKey,
  onClose
}: {
  integrationKey: SettingsIntegrationKey;
  onClose: () => void;
}) {
  const { draft, setIntegration } = useIntegrationsSettingsDraft();
  const entry = draft.integrations[integrationKey];
  const { register, handleSubmit, formState } = useForm<SettingsIntegrationFormValues>({
    resolver: zodResolver(settingsIntegrationFormSchema),
    defaultValues: { status: entry.status, detail: entry.detail }
  });
  const errors = formState.errors;

  const submit = handleSubmit((values) => {
    setIntegration(integrationKey, { status: 'connected', detail: values.detail.trim() });
    onClose();
  });

  function disconnect() {
    setIntegration(integrationKey, { status: 'not_connected', detail: entry.detail });
    onClose();
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <p className="text-sm text-[#586987]">
        {SETTINGS_INTEGRATION_META[integrationKey].description}
      </p>
      <Field label={DETAIL_LABEL[integrationKey]} error={errors.detail?.message}>
        <Input
          aria-invalid={Boolean(errors.detail)}
          placeholder="Not required for this demo"
          {...register('detail')}
        />
      </Field>
      <div className="flex flex-wrap justify-end gap-2">
        {entry.status === 'connected' && (
          <Button type="button" variant="danger" onClick={disconnect}>
            <Unlink className="size-4" aria-hidden />
            Disconnect
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          <Check className="size-4" aria-hidden />
          {entry.status === 'connected' ? 'Save' : 'Connect'}
        </Button>
      </div>
    </form>
  );
}

/**
 * Connect (not-connected row) and Configure (connected row) share this dialog. Submitting sets the
 * row to Connected in the draft; Disconnect sets it back. Nothing here is a real integration — the
 * detail field is a non-secret label only, never a password or API secret.
 */
export function SettingsIntegrationConfigDialog({
  open,
  integrationKey,
  onClose
}: {
  open: boolean;
  integrationKey: SettingsIntegrationKey | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open && integrationKey !== null}
      onClose={onClose}
      title={integrationKey ? SETTINGS_INTEGRATION_META[integrationKey].title : 'Integration'}
    >
      {open && integrationKey ? (
        <Body key={integrationKey} integrationKey={integrationKey} onClose={onClose} />
      ) : null}
    </Dialog>
  );
}
