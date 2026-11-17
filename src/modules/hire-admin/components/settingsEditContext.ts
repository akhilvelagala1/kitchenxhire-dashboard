import { createContext, useContext } from 'react';

const SettingsEditContext = createContext(false);

/** The page tells every card whether this person may change settings (hire.admin.manage). */
export const SettingsEditProvider = SettingsEditContext.Provider;

/** True when the controls should be editable; false makes every field and switch read-only. */
export function useCanEditSettings(): boolean {
  return useContext(SettingsEditContext);
}
