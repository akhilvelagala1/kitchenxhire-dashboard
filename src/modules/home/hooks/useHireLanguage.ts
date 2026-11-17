import { createContext, useContext } from 'react';
import { translateHireCopy } from '../content/hireCopy';
import type { HireLanguage } from '../content/languages';

export interface HireLanguageValue {
  language: HireLanguage;
  setLanguage: (value: HireLanguage) => void;
  tx: (text: string) => string;
}

const fallbackHireLanguage: HireLanguageValue = {
  language: 'en',
  setLanguage: () => undefined,
  tx: (text) => translateHireCopy('en', text)
};

export const HireLanguageContext = createContext<HireLanguageValue>(fallbackHireLanguage);

export function useHireLanguage(): HireLanguageValue {
  return useContext(HireLanguageContext);
}
