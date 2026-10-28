import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './en';
import hi from './hi';

const STORAGE_KEY = 'nutriowl_language';
const dictionaries = { en, hi };
// Locale used for dates and times in each language.
const locales = { en: undefined, hi: 'hi-IN' };

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (dictionaries[stored]) return stored;
  } catch {
    // Storage can be unavailable (private mode); fall through to the browser language.
  }
  return navigator.language?.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

function lookup(dictionary, key) {
  return key.split('.').reduce((value, part) => (value == null ? undefined : value[part]), dictionary);
}

function interpolate(text, vars) {
  return vars ? text.replace(/\{(\w+)\}/g, (match, name) => (vars[name] ?? match)) : text;
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // The choice still applies for this visit.
    }
  }, [language]);

  const setLanguage = useCallback(next => {
    if (dictionaries[next]) setLanguageState(next);
  }, []);

  const value = useMemo(() => {
    const dictionary = dictionaries[language];

    // Looks up a dotted key, falling back to English, then to the key itself.
    // String values get {placeholder} substitution; arrays and objects are returned as-is.
    function t(key, vars) {
      const found = lookup(dictionary, key) ?? lookup(en, key);
      if (found === undefined) return key;
      return typeof found === 'string' ? interpolate(found, vars) : found;
    }

    // Display name for a value stored in English (e.g. a diet preference), or the value itself.
    function tOption(group, storedValue) {
      return dictionary.options?.[group]?.[storedValue] ?? storedValue;
    }

    // Goal titles and units arrive from the API in English.
    function goalTitle(goal) {
      const template = dictionary.goals?.titles?.[goal.id];
      return template ? interpolate(template, { count: goal.target }) : goal.title;
    }

    function goalUnit(unit) {
      return dictionary.goals?.units?.[unit] ?? unit;
    }

    return { language, setLanguage, locale: locales[language], t, tOption, goalTitle, goalUnit };
  }, [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useI18n must be used inside LanguageProvider');
  return context;
}
