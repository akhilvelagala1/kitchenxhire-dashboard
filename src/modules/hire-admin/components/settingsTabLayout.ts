import { AUDIT_GRID_CLASS } from './settingsAuditLogsDensity';
import { INTEGRATIONS_GRID_CLASS } from './settingsIntegrationsDensity';
import { SECURITY_GRID_CLASS } from './settingsSecurityDensity';

export type SettingsTabKey =
  'general' | 'hiring' | 'users' | 'notifications' | 'integrations' | 'security' | 'audit';

/** Everything one tab's draft/save state hands the page, so it never cares which tab is active. */
export interface TabState {
  cardNames: readonly string[];
  ready: boolean;
  loading: boolean;
  error: unknown;
  refetch: () => void;
  canEdit: boolean;
  isDirty: boolean;
  isSaving: boolean;
  save: () => void;
  reset: () => void;
  showActions: boolean;
}

/** True for every tab that uses the denser scale and tighter page padding. */
export function isDenseTab(tab: SettingsTabKey): boolean {
  return tab !== 'general';
}

/** The `.fit-scale-settings-*` class that sizes `--u` for this tab's picture. */
export function settingsScaleClass(tab: SettingsTabKey): string {
  return tab === 'general' ? 'fit-scale-settings' : `fit-scale-settings-${tab}`;
}

/** The grid-template-columns class for this tab's card row (two unequal cards vs. a 2×2 square). */
export function settingsGridColsClass(tab: SettingsTabKey): string {
  if (tab === 'integrations') return INTEGRATIONS_GRID_CLASS;
  if (tab === 'security') return SECURITY_GRID_CLASS;
  if (tab === 'audit') return AUDIT_GRID_CLASS;
  return 'lg:grid-cols-2';
}

/** The grid-template-rows class: one card row for Integrations/Security/Audit, a 2×2 square otherwise. */
export function settingsGridRowsClass(tab: SettingsTabKey): string {
  return tab === 'integrations' || tab === 'security' || tab === 'audit'
    ? 'lg:grid-rows-[auto_auto_auto]'
    : 'lg:grid-rows-[auto_auto_auto_auto]';
}
