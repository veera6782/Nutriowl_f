import React from 'react';
import { useI18n } from '../i18n/LanguageContext';

const LANGUAGES = [
  { code: 'en', key: 'language.english' },
  { code: 'hi', key: 'language.hindi' }
];

export default function LanguageToggle({ className = '' }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div role="group" aria-label={t('language.label')} className={`inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-[#dfe8da] ${className}`}>
      {LANGUAGES.map(option => {
        const active = language === option.code;
        return (
          <button
            key={option.code}
            type="button"
            lang={option.code}
            aria-pressed={active}
            onClick={() => setLanguage(option.code)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${active ? 'bg-[#4CAF50] text-white shadow-sm' : 'text-darkgreen hover:bg-green-50'}`}
          >
            {t(option.key)}
          </button>
        );
      })}
    </div>
  );
}
