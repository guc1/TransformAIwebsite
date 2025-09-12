"use client";

import {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';

export function LanguageSwitcherModal() {
  const t = useTranslations('LanguageModal');
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale');
      if (!stored) {
        setOpen(true);
      }
    }
  }, []);

  function selectLocale(locale: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale);
      document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
    }
    setOpen(false);
    const newPath =
      locale === 'en'
        ? pathname.replace(/^\/nl/, '')
        : pathname.startsWith('/nl')
        ? pathname
        : `/nl${pathname}`;
    router.replace(newPath);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded bg-white p-4 text-black">
        <p className="mb-2">{t('title')}</p>
        <div className="flex space-x-2">
          <button onClick={() => selectLocale('en')} className="border px-2 py-1">
            {t('english')}
          </button>
          <button onClick={() => selectLocale('nl')} className="border px-2 py-1">
            {t('dutch')}
          </button>
        </div>
      </div>
    </div>
  );
}
