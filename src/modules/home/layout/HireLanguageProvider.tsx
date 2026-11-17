import { useMemo, useState, type ReactNode } from 'react';
import { translateHireCopy } from '../content/hireCopy';
import { readHireLanguage, writeHireLanguage, type HireLanguage } from '../content/languages';
import { HireLanguageContext, type HireLanguageValue } from '../hooks/useHireLanguage';

export function HireLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<HireLanguage>(readHireLanguage);

  const value = useMemo<HireLanguageValue>(
    () => ({
      language,
      setLanguage(next) {
        writeHireLanguage(next);
        setLanguageState(next);
      },
      tx: (text) => translateHireCopy(language, text)
    }),
    [language]
  );

  return <HireLanguageContext.Provider value={value}>{children}</HireLanguageContext.Provider>;
}
