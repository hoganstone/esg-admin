'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { type Locale, translations } from '@/i18n/translations';

type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K] extends object ? DeepMutable<T[K]> : T[K];
};

type TranslationValue = DeepMutable<typeof translations[Locale]>;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationValue;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'esg-admin-locale';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh-TW');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in translations) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] as TranslationValue }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
