'use client';
import { useEffect } from 'react';
import i18n from './i18n';
import { useAuthStore } from '@/store/auth.store';

export function I18nInitializer() {
  const { user } = useAuthStore();

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('preferred_lang') : null;
    const lang = stored || user?.preferredLang || i18n.language || 'ru';
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
  }, [user?.preferredLang, user?.id]);

  useEffect(() => {
    const handler = (lng: string) => {
      document.documentElement.lang = lng;
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred_lang', lng);
      }
    };
    i18n.on('languageChanged', handler);
    return () => { i18n.off('languageChanged', handler); };
  }, []);

  return null;
}
