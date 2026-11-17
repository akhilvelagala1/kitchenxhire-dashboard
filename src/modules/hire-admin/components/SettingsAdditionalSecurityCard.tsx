import { useState } from 'react';
import { FileText, MapPin, Monitor, Users } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';
import { SettingsAdminAccessDialog } from './SettingsAdminAccessDialog';
import { SettingsActiveSessionsDialog } from './SettingsActiveSessionsDialog';
import { SettingsCard } from './SettingsCard';
import { SettingsLoginHistoryDialog } from './SettingsLoginHistoryDialog';
import { SettingsRow } from './SettingsRow';
import {
  SECURITY_ACTION_BTN,
  SECURITY_CARD_CLASS,
  SECURITY_ROWS_CLASS,
  SECURITY_SWITCH
} from './settingsSecurityDensity';
import { useCanEditSettings } from './settingsEditContext';
import { useSecuritySettingsDraft } from './securitySettingsContext';

/** Right card: IP Restriction, Admin Access Control, Login History, Active Sessions. */
export function SettingsAdditionalSecurityCard() {
  const canEdit = useCanEditSettings();
  const { draft, setIpRestriction } = useSecuritySettingsDraft();
  const [adminAccessOpen, setAdminAccessOpen] = useState(false);
  const [loginHistoryOpen, setLoginHistoryOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);

  return (
    <>
      <SettingsCard
        title="Additional Security"
        description="Advanced security controls."
        className={SECURITY_CARD_CLASS}
      >
        <div className={SECURITY_ROWS_CLASS}>
          <SettingsRow
            icon={MapPin}
            tone="blue"
            title="IP Restriction"
            description="Allow access from specific IP addresses"
          >
            <Switch
              checked={draft.ip_restriction}
              onCheckedChange={setIpRestriction}
              disabled={!canEdit}
              aria-label="IP Restriction"
              className={SECURITY_SWITCH}
            />
          </SettingsRow>
          <SettingsRow
            icon={Users}
            tone="blue"
            title="Admin Access Control"
            description="Restrict access by role and module"
          >
            <Button
              variant="secondary"
              onClick={() => setAdminAccessOpen(true)}
              className={SECURITY_ACTION_BTN}
            >
              Configure
            </Button>
          </SettingsRow>
          <SettingsRow
            icon={FileText}
            tone="orange"
            title="Login History"
            description="View and manage login activities"
          >
            <Button
              variant="secondary"
              onClick={() => setLoginHistoryOpen(true)}
              className={SECURITY_ACTION_BTN}
            >
              View Logs
            </Button>
          </SettingsRow>
          <SettingsRow
            icon={Monitor}
            tone="amber"
            title="Active Sessions"
            description="Manage current active sessions"
            className="border-b-0"
          >
            <Button
              variant="secondary"
              onClick={() => setSessionsOpen(true)}
              className={SECURITY_ACTION_BTN}
            >
              View Sessions
            </Button>
          </SettingsRow>
        </div>
      </SettingsCard>
      <SettingsAdminAccessDialog open={adminAccessOpen} onClose={() => setAdminAccessOpen(false)} />
      <SettingsLoginHistoryDialog
        open={loginHistoryOpen}
        onClose={() => setLoginHistoryOpen(false)}
      />
      <SettingsActiveSessionsDialog open={sessionsOpen} onClose={() => setSessionsOpen(false)} />
    </>
  );
}
