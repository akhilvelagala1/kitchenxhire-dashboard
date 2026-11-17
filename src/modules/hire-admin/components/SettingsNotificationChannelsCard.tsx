import { AppWindow, Bell, Mail, MessageCircle, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Switch } from '@/shared/ui/Switch';
import {
  SETTINGS_NOTIFICATION_CHANNELS,
  SETTINGS_NOTIFICATION_CHANNEL_META,
  type SettingsNotificationChannel
} from '../schemas/adminSettingsNotifications';
import { SettingsCard } from './SettingsCard';
import { SettingsRow } from './SettingsRow';
import {
  NOTIFICATIONS_CARD_CLASS,
  NOTIFICATIONS_ROWS_CLASS,
  NOTIFICATIONS_SWITCH
} from './settingsNotificationsDensity';
import { useCanEditSettings } from './settingsEditContext';
import { useNotificationsSettingsDraft } from './notificationsSettingsContext';

const CHANNEL_ICON: Record<
  SettingsNotificationChannel,
  { icon: LucideIcon; tone: 'purple' | 'pink' | 'green' | 'blue' | 'orange' }
> = {
  email: { icon: Mail, tone: 'purple' },
  sms: { icon: MessageSquare, tone: 'pink' },
  whatsapp: { icon: MessageCircle, tone: 'green' },
  in_app: { icon: AppWindow, tone: 'purple' },
  push: { icon: Bell, tone: 'orange' }
};

/** Top-left Notifications card: enable/disable delivery channels. */
export function SettingsNotificationChannelsCard() {
  const canEdit = useCanEditSettings();
  const { draft, setChannel } = useNotificationsSettingsDraft();

  return (
    <SettingsCard
      title="Notification Channels"
      description="Enable and configure notification channels."
      className={NOTIFICATIONS_CARD_CLASS}
    >
      <div className={NOTIFICATIONS_ROWS_CLASS}>
        {SETTINGS_NOTIFICATION_CHANNELS.map((key) => {
          const meta = SETTINGS_NOTIFICATION_CHANNEL_META[key];
          const { icon, tone } = CHANNEL_ICON[key];
          return (
            <SettingsRow
              key={key}
              icon={icon}
              tone={tone}
              title={meta.title}
              description={meta.description}
            >
              <Switch
                checked={draft.channels[key]}
                onCheckedChange={(on) => setChannel(key, on)}
                disabled={!canEdit}
                aria-label={meta.title}
                className={NOTIFICATIONS_SWITCH}
              />
            </SettingsRow>
          );
        })}
      </div>
    </SettingsCard>
  );
}
