'use client';
import { I18nProvider, useI18n } from '@/lib/i18n/I18nProvider';
import { useEffect } from 'react';

function HtmlAttrs() {
  const { dir, lang } = useI18n();
  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [dir, lang]);
  return null;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <HtmlAttrs />
      {children}
    </I18nProvider>
  );
}

