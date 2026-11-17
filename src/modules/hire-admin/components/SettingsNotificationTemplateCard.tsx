import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input, Select, Textarea } from '@/shared/ui/Input';
import {
  SETTINGS_NOTIFICATION_EVENTS,
  SETTINGS_NOTIFICATION_EVENT_META,
  type SettingsNotificationEvent
} from '../schemas/adminSettingsNotifications';
import { SettingsCard } from './SettingsCard';
import { SettingsNotificationTemplateDialog } from './SettingsNotificationTemplateDialog';
import { NOTIFICATIONS_BTN, NOTIFICATIONS_CARD_CLASS } from './settingsNotificationsDensity';
import { useCanEditSettings } from './settingsEditContext';
import { useNotificationsSettingsDraft } from './notificationsSettingsContext';

const FIELD =
  'lg:h-[calc(35*var(--u))] lg:min-h-0 lg:rounded-[calc(10*var(--u))] lg:px-[calc(12*var(--u))] lg:text-[calc(13*var(--u))]';

/** Bottom-left Notifications card: preview a template and open the editor. */
export function SettingsNotificationTemplateCard() {
  const canEdit = useCanEditSettings();
  const { draft } = useNotificationsSettingsDraft();
  const [selectedEvent, setSelectedEvent] =
    useState<SettingsNotificationEvent>('new_job_application');
  const [editing, setEditing] = useState(false);
  const template = draft.templates[selectedEvent];

  return (
    <SettingsCard
      title="Notification Template"
      description="Edit notification message templates."
      className={NOTIFICATIONS_CARD_CLASS}
    >
      <div className="flex flex-col gap-2 lg:gap-[calc(8*var(--u))]">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#111827] lg:text-[calc(13*var(--u))]">
            Event
          </span>
          <Select
            aria-label="Template event"
            value={selectedEvent}
            onChange={(event) => setSelectedEvent(event.target.value as SettingsNotificationEvent)}
            className={FIELD}
          >
            {SETTINGS_NOTIFICATION_EVENTS.map((key) => (
              <option key={key} value={key}>
                {SETTINGS_NOTIFICATION_EVENT_META[key].title}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#111827] lg:text-[calc(13*var(--u))]">
            Subject
          </span>
          <Input
            aria-label="Template subject"
            value={template.subject}
            readOnly
            className={FIELD}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#111827] lg:text-[calc(13*var(--u))]">
            Message
          </span>
          <Textarea
            aria-label="Template message"
            value={template.message}
            readOnly
            rows={3}
            className="min-h-[68px] resize-y lg:min-h-[calc(68*var(--u))] lg:rounded-[calc(10*var(--u))] lg:px-[calc(12*var(--u))] lg:py-[calc(8*var(--u))] lg:text-[calc(13*var(--u))]"
          />
        </label>
        {canEdit ? (
          <Button
            variant="secondary"
            className={NOTIFICATIONS_BTN}
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-4 lg:size-[calc(16*var(--u))]" aria-hidden />
            Edit Template
          </Button>
        ) : null}
      </div>

      <SettingsNotificationTemplateDialog
        open={editing}
        eventKey={selectedEvent}
        onClose={() => setEditing(false)}
      />
    </SettingsCard>
  );
}
