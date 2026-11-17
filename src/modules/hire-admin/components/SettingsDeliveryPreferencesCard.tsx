import { useId } from 'react';
import { BarChart3, Clock3, RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Input, Select } from '@/shared/ui/Input';
import {
  SETTINGS_NOTIFICATION_PRIORITIES,
  SETTINGS_NOTIFICATION_RETRY,
  SETTINGS_NOTIFICATION_TIMES,
  type SettingsNotificationPriority,
  type SettingsNotificationTime
} from '../schemas/adminSettingsNotifications';
import { SettingsCard } from './SettingsCard';
import { SettingsRow } from './SettingsRow';
import { NOTIFICATIONS_CARD_CLASS, NOTIFICATIONS_ROWS_CLASS } from './settingsNotificationsDensity';
import { useCanEditSettings } from './settingsEditContext';
import { useNotificationsSettingsDraft } from './notificationsSettingsContext';

const SELECT =
  'h-9 min-h-0 w-[108px] rounded-[10px] px-2.5 text-sm lg:h-[calc(36*var(--u))] lg:w-[calc(108*var(--u))] lg:rounded-[calc(10*var(--u))] lg:px-[calc(10*var(--u))] lg:text-[calc(13*var(--u))]';

/** Bottom-right Notifications card: quiet hours, retries, and priority. */
export function SettingsDeliveryPreferencesCard() {
  const canEdit = useCanEditSettings();
  const { draft, setQuietHoursStart, setQuietHoursEnd, setRetryAttempts, setPriority } =
    useNotificationsSettingsDraft();
  const quietId = useId();
  const quietTitle = `${quietId}-title`;
  const quietDesc = `${quietId}-desc`;
  const retryId = useId();
  const retryTitle = `${retryId}-title`;
  const retryDesc = `${retryId}-desc`;
  const priorityId = useId();
  const priorityTitle = `${priorityId}-title`;
  const priorityDesc = `${priorityId}-desc`;

  return (
    <SettingsCard
      title="Delivery Preferences"
      description="Configure delivery timing and retry settings."
      className={NOTIFICATIONS_CARD_CLASS}
    >
      <div className={NOTIFICATIONS_ROWS_CLASS}>
        <SettingsRow
          icon={Clock3}
          tone="blue"
          title="Quiet Hours"
          description="Do not send non-urgent notifications during this time"
          titleId={quietTitle}
          descriptionId={quietDesc}
        >
          <div className="flex items-center gap-2 lg:gap-[calc(10*var(--u))]">
            <Select
              aria-label="Quiet hours start"
              aria-labelledby={quietTitle}
              aria-describedby={quietDesc}
              disabled={!canEdit}
              value={draft.quiet_hours_start}
              onChange={(event) =>
                setQuietHoursStart(event.target.value as SettingsNotificationTime)
              }
              className={SELECT}
            >
              {SETTINGS_NOTIFICATION_TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Select>
            <span aria-hidden className="text-sm text-[#586987] lg:text-[calc(13*var(--u))]">
              to
            </span>
            <Select
              aria-label="Quiet hours end"
              disabled={!canEdit}
              value={draft.quiet_hours_end}
              onChange={(event) => setQuietHoursEnd(event.target.value as SettingsNotificationTime)}
              className={SELECT}
            >
              {SETTINGS_NOTIFICATION_TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Select>
          </div>
        </SettingsRow>
        <SettingsRow
          icon={RefreshCw}
          tone="pink"
          title="Retry Attempts"
          description="Number of retry attempts for failed notifications"
          titleId={retryTitle}
          descriptionId={retryDesc}
        >
          <div className="flex items-center gap-2 lg:gap-[calc(8*var(--u))]">
            <Input
              type="number"
              inputMode="numeric"
              min={SETTINGS_NOTIFICATION_RETRY.min}
              max={SETTINGS_NOTIFICATION_RETRY.max}
              value={draft.retry_attempts}
              aria-labelledby={retryTitle}
              aria-describedby={retryDesc}
              disabled={!canEdit}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!Number.isFinite(next)) return;
                setRetryAttempts(
                  Math.max(
                    SETTINGS_NOTIFICATION_RETRY.min,
                    Math.min(SETTINGS_NOTIFICATION_RETRY.max, Math.trunc(next))
                  )
                );
              }}
              className="w-[90px] text-center lg:h-[calc(36*var(--u))] lg:min-h-0 lg:w-[calc(110*var(--u))] lg:rounded-[calc(10*var(--u))] lg:px-[calc(8*var(--u))] lg:text-[calc(14*var(--u))]"
            />
            <span aria-hidden className="text-sm text-[#586987] lg:text-[calc(13*var(--u))]">
              attempts
            </span>
          </div>
        </SettingsRow>
        <SettingsRow
          icon={BarChart3}
          tone="green"
          title="Notification Priority"
          description="Set default priority for platform notifications"
          titleId={priorityTitle}
          descriptionId={priorityDesc}
          className={cn('border-b-0')}
        >
          <Select
            aria-label="Notification priority"
            aria-labelledby={priorityTitle}
            aria-describedby={priorityDesc}
            disabled={!canEdit}
            value={draft.priority}
            onChange={(event) => setPriority(event.target.value as SettingsNotificationPriority)}
            className="h-9 min-h-0 w-[162px] rounded-[10px] px-2.5 text-sm lg:h-[calc(36*var(--u))] lg:w-[calc(162*var(--u))] lg:rounded-[calc(10*var(--u))] lg:px-[calc(12*var(--u))] lg:text-[calc(13*var(--u))]"
          >
            {SETTINGS_NOTIFICATION_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
        </SettingsRow>
      </div>
    </SettingsCard>
  );
}
