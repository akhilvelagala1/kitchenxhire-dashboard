import { createContext, useContext } from 'react';
import type { FlowKey } from '../schemas/home';

/** State the header, the hero search and the job list share. */
export interface HomeState {
  role: string;
  /** The role card highlighted after a click. Typing in the role field clears it. */
  activeRole: string | null;
  city: string;
  /** The city picked in the header, which can differ from the text typed in the search. */
  location: string;
  flow: FlowKey;
  activeSection: string;
  typeRole: (value: string) => void;
  pickRole: (query: string) => void;
  setCity: (value: string) => void;
  selectLocation: (name: string) => void;
  resetSearch: () => void;
  setFlow: (flow: FlowKey) => void;
  setActiveSection: (id: string) => void;
}

export const HomeStateContext = createContext<HomeState | null>(null);

export function useHomeState(): HomeState {
  const value = useContext(HomeStateContext);
  if (!value) throw new Error('useHomeState must be used inside HomeStateProvider');
  return value;
}
