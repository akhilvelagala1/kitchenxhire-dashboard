import { Building2, CircleCheck, Globe, Users } from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { SettingsToggleRow } from './SettingsToggleRow';

/**
 * Platform Preferences, the top-right card of Settings: four switches for how the platform behaves.
 * The rows share the card's height evenly from lg up (never below 52 design px each); on a phone
 * the explanations wrap and the rows grow with them. SettingsToggleRow wires each switch to the
 * page's form and makes it read-only without hire.admin.manage.
 */
export function SettingsPreferencesCard() {
  return (
    <SettingsCard
      title="Platform Preferences"
      description="General platform behaviour and display settings."
      className="h-full min-h-0"
    >
      <SettingsToggleRow
        name="multi_business"
        icon={Globe}
        tone="purple"
        title="Multi-business Platform"
        description="Allow multiple businesses (restaurants, kitchens, warehouses, etc.)"
        className="flex-1"
      />
      <SettingsToggleRow
        name="enable_outlets"
        icon={Building2}
        tone="orange"
        title="Enable Outlets"
        description="Manage outlets under each business"
        className="flex-1"
      />
      <SettingsToggleRow
        name="self_registration"
        icon={Users}
        tone="pink"
        title="Self Registration"
        description="Allow businesses and recruiters to register on the platform"
        className="flex-1"
      />
      <SettingsToggleRow
        name="business_verification"
        icon={CircleCheck}
        tone="green"
        title="Business Verification"
        description="Require admin verification for new business registrations"
        className="flex-1"
      />
    </SettingsCard>
  );
}
