import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { siteCopy, type Locale } from '../lib/translations';

type LocaleValue = {
  locale: Locale;
  copy: (typeof siteCopy)[Locale];
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  // English is deliberately the default. A visitor's explicit choice is kept
  // on this device, but browser language never changes it automatically.
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    return window.localStorage.getItem('freshpods-locale') === 'ne' ? 'ne' : 'en';
  });

  const copy = siteCopy[locale];

  useEffect(() => {
    document.documentElement.lang = locale === 'ne' ? 'ne-NP' : 'en';
    document.title = copy.meta.title;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', copy.meta.description);
    window.localStorage.setItem('freshpods-locale', locale);
  }, [copy.meta.description, copy.meta.title, locale]);

  const value = useMemo(
    () => ({ locale, copy, toggleLocale: () => setLocale((current) => (current === 'en' ? 'ne' : 'en')) }),
    [copy, locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useLocale must be used inside <LocaleProvider>');
  return value;
}
