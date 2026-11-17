import { pick } from './listParams';

/** The Settings section pills that have a screen. The other one stays "Coming soon". */
const SETTINGS_TABS = [
  'general',
  'hiring',
  'users',
  'notifications',
  'integrations',
  'security',
  'audit'
] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];

/** Everything the Settings page keeps in the URL. No `tab` means General. */
export function parseSettingsSearchParams(searchParams: URLSearchParams) {
  return {
    tab: pick(searchParams.get('tab'), SETTINGS_TABS, 'general')
  };
}
