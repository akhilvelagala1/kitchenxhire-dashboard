import { SettingsDeliveryPreferencesCard } from './SettingsDeliveryPreferencesCard';
import { SettingsNotificationChannelsCard } from './SettingsNotificationChannelsCard';
import { SettingsNotificationEventsCard } from './SettingsNotificationEventsCard';
import { SettingsNotificationTemplateCard } from './SettingsNotificationTemplateCard';

/**
 * The Notifications tab content: four cards for the page's 2×2 grid (Channels, Events, Template,
 * Delivery Preferences).
 */
export function SettingsNotificationsPanel() {
  return (
    <>
      <SettingsNotificationChannelsCard />
      <SettingsNotificationEventsCard />
      <SettingsNotificationTemplateCard />
      <SettingsDeliveryPreferencesCard />
    </>
  );
}
