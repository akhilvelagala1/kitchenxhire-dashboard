import { useState } from 'react';
import {
  CalendarDays,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import {
  SETTINGS_INTEGRATION_KEYS,
  SETTINGS_INTEGRATION_META,
  type SettingsIntegrationKey
} from '../schemas/adminSettingsIntegrations';
import { SettingsCard } from './SettingsCard';
import { SettingsIntegrationConfigDialog } from './SettingsIntegrationConfigDialog';
import {
  INTEGRATIONS_ACTION_BTN,
  INTEGRATIONS_CARD_CLASS,
  INTEGRATIONS_ICON_TILE_CLASS,
  INTEGRATIONS_ROW_CLASS,
  INTEGRATIONS_STATUS_PILL
} from './settingsIntegrationsDensity';
import { useCanEditSettings } from './settingsEditContext';
import { useIntegrationsSettingsDraft } from './integrationsSettingsContext';

const ICON: Record<SettingsIntegrationKey, { icon: LucideIcon; tile: string; glyph: string }> = {
  smtp: { icon: Mail, tile: 'bg-[#FFF4DC]', glyph: 'text-[#FF7900]' },
  sms: { icon: MessageSquare, tile: 'bg-[#EAF2FF]', glyph: 'text-[#1763FF]' },
  whatsapp: { icon: MessageCircle, tile: 'bg-[#E8F9ED]', glyph: 'text-[#00B946]' },
  google_calendar: { icon: CalendarDays, tile: 'bg-[#EAF1FF]', glyph: 'text-[#155DFF]' },
  google_maps: { icon: MapPin, tile: 'bg-[#FFF0E4]', glyph: 'text-[#FF4B0B]' }
};

/** Left card: the five third-party services, each with a status pill and a Connect/Configure button. */
export function SettingsConnectedIntegrationsCard() {
  const canEdit = useCanEditSettings();
  const { draft } = useIntegrationsSettingsDraft();
  const [openKey, setOpenKey] = useState<SettingsIntegrationKey | null>(null);

  return (
    <>
      <SettingsCard
        title="Connected Integrations"
        description="Integrate with third-party services."
        className={INTEGRATIONS_CARD_CLASS}
      >
        <div className="flex flex-col">
          {SETTINGS_INTEGRATION_KEYS.map((key) => {
            const meta = SETTINGS_INTEGRATION_META[key];
            const entry = draft.integrations[key];
            const connected = entry.status === 'connected';
            const tone = ICON[key];
            const Icon = tone.icon;
            return (
              <div key={key} className={INTEGRATIONS_ROW_CLASS}>
                <span aria-hidden className={cn(INTEGRATIONS_ICON_TILE_CLASS, tone.tile)}>
                  <Icon
                    className={cn('size-6 lg:size-[calc(24*var(--u))]', tone.glyph)}
                    strokeWidth={1.9}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-[#111827] lg:text-[calc(15*var(--u))]">
                    {meta.title}
                  </p>
                  <p className="truncate text-[13px] text-[#586987] lg:text-[calc(12.5*var(--u))]">
                    {meta.description}
                  </p>
                </div>
                <span
                  className={cn(
                    INTEGRATIONS_STATUS_PILL,
                    connected ? 'bg-[#DCFCE4] text-[#078A27]' : 'bg-[#FFE1E1] text-[#F02020]'
                  )}
                >
                  {connected ? 'Connected' : 'Not Connected'}
                </span>
                <Button
                  variant="secondary"
                  disabled={!canEdit}
                  onClick={() => setOpenKey(key)}
                  className={INTEGRATIONS_ACTION_BTN}
                >
                  {connected ? 'Configure' : 'Connect'}
                </Button>
              </div>
            );
          })}
        </div>
      </SettingsCard>
      <SettingsIntegrationConfigDialog
        open={openKey !== null}
        integrationKey={openKey}
        onClose={() => setOpenKey(null)}
      />
    </>
  );
}
