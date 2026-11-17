import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_CITY } from '../content/nav';
import { HomeStateContext, type HomeState } from '../hooks/useHomeState';
import type { FlowKey } from '../schemas/home';

export function HomeStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState('');
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [location, setLocation] = useState(DEFAULT_CITY);
  const [flow, setFlow] = useState<FlowKey>('seeker');
  const [activeSection, setActiveSection] = useState('');

  const typeRole = useCallback((value: string) => {
    setRole(value);
    setActiveRole(null);
  }, []);

  const pickRole = useCallback((query: string) => {
    setRole(query);
    setActiveRole(query);
  }, []);

  const selectLocation = useCallback((name: string) => {
    setLocation(name);
    setCity(name === DEFAULT_CITY ? '' : name);
  }, []);

  const resetSearch = useCallback(() => {
    setRole('');
    setActiveRole(null);
    setCity('');
    setLocation(DEFAULT_CITY);
  }, []);

  const value = useMemo<HomeState>(
    () => ({
      role,
      activeRole,
      city,
      location,
      flow,
      activeSection,
      typeRole,
      pickRole,
      setCity,
      selectLocation,
      resetSearch,
      setFlow,
      setActiveSection
    }),
    [
      role,
      activeRole,
      city,
      location,
      flow,
      activeSection,
      typeRole,
      pickRole,
      selectLocation,
      resetSearch
    ]
  );

  return <HomeStateContext.Provider value={value}>{children}</HomeStateContext.Provider>;
}
