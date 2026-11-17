import {
  SETTINGS_NOTIFICATION_EVENTS,
  SETTINGS_NOTIFICATION_EVENT_META
} from '../schemas/adminSettingsNotifications';
import { SettingsCard } from './SettingsCard';
import { NOTIFICATIONS_CARD_CLASS } from './settingsNotificationsDensity';
import { useCanEditSettings } from './settingsEditContext';
import { useNotificationsSettingsDraft } from './notificationsSettingsContext';

/** Top-right Notifications card: which events trigger notifications. */
export function SettingsNotificationEventsCard() {
  const canEdit = useCanEditSettings();
  const { draft, setEvent } = useNotificationsSettingsDraft();

  return (
    <SettingsCard
      title="Notification Events"
      description="Choose when to send notifications and to whom."
      className={NOTIFICATIONS_CARD_CLASS}
    >
      <ul className="flex flex-col divide-y divide-[#E8ECF2]">
        {SETTINGS_NOTIFICATION_EVENTS.map((key) => {
          const meta = SETTINGS_NOTIFICATION_EVENT_META[key];
          const checked = draft.events[key];
          return (
            <li key={key}>
              <label className="flex min-h-[48px] cursor-pointer items-center gap-3 py-2 has-disabled:cursor-not-allowed lg:min-h-[calc(48*var(--u))] lg:gap-[calc(16*var(--u))] lg:py-0">
                <input
                  type="checkbox"
                  aria-label={meta.title}
                  checked={checked}
                  disabled={!canEdit}
                  onChange={(event) => setEvent(key, event.target.checked)}
                  className="size-5 shrink-0 accent-brand-600 lg:size-[calc(20*var(--u))]"
                />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-semibold text-[#111827] lg:text-[calc(14.5*var(--u))]">
                    {meta.title}
                  </span>
                  <span className="block truncate text-[13px] text-[#586987] lg:text-[calc(12*var(--u))]">
                    {meta.description}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </SettingsCard>
  );
}
