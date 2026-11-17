import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { Input, Textarea } from '@/shared/ui/Input';
import {
  SETTINGS_NOTIFICATION_EVENT_META,
  settingsNotificationTemplateFormSchema,
  type SettingsNotificationEvent,
  type SettingsNotificationTemplateFormValues
} from '../schemas/adminSettingsNotifications';
import { useNotificationsSettingsDraft } from './notificationsSettingsContext';

function Body({ eventKey, onClose }: { eventKey: SettingsNotificationEvent; onClose: () => void }) {
  const { draft, setTemplate } = useNotificationsSettingsDraft();
  const existing = draft.templates[eventKey];
  const { register, handleSubmit, formState } = useForm<SettingsNotificationTemplateFormValues>({
    resolver: zodResolver(settingsNotificationTemplateFormSchema),
    defaultValues: { subject: existing.subject, message: existing.message }
  });
  const errors = formState.errors;

  const submit = handleSubmit((values) => {
    setTemplate(eventKey, {
      subject: values.subject.trim(),
      message: values.message.trim()
    });
    onClose();
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <p className="text-sm text-[#586987]">{SETTINGS_NOTIFICATION_EVENT_META[eventKey].title}</p>
      <Field label="Subject" error={errors.subject?.message}>
        <Input aria-invalid={Boolean(errors.subject)} {...register('subject')} />
      </Field>
      <Field label="Message" error={errors.message?.message}>
        <Textarea rows={5} aria-invalid={Boolean(errors.message)} {...register('message')} />
      </Field>
      <p className="text-xs text-[#586987]">
        Available variables: {'{{job_title}}'}, {'{{business_name}}'}, {'{{candidate_name}}'}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          <Check className="size-4" aria-hidden />
          Save Template
        </Button>
      </div>
    </form>
  );
}

/** Draft-only template editor; Save Template updates local draft until page Save Changes. */
export function SettingsNotificationTemplateDialog({
  open,
  eventKey,
  onClose
}: {
  open: boolean;
  eventKey: SettingsNotificationEvent;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Edit Notification Template">
      {open ? <Body key={eventKey} eventKey={eventKey} onClose={onClose} /> : null}
    </Dialog>
  );
}
