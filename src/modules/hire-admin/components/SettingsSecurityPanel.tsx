import { SettingsAccessAuthCard } from './SettingsAccessAuthCard';
import { SettingsAdditionalSecurityCard } from './SettingsAdditionalSecurityCard';

/** The Security tab content: two side-by-side cards (Access & Authentication, Additional Security). */
export function SettingsSecurityPanel() {
  return (
    <>
      <SettingsAccessAuthCard />
      <SettingsAdditionalSecurityCard />
    </>
  );
}
