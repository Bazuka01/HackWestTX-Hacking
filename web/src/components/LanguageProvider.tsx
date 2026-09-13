"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  LanguageWash,
  createLanguageParticles,
  type LanguageParticle,
} from "@/components/effects/LanguageWash";
import {
  CHARSETS,
  LANGUAGE_COOKIE,
  LOCALES,
  MESSAGES,
  type LanguageCode,
} from "@/lib/i18n";

const LanguageContext = createContext<LanguageCode>("en");

export function useLanguage() {
  return useContext(LanguageContext);
}

// The current language's text, e.g. t.nav.calendar.
export function useT() {
  return MESSAGES[useLanguage()];
}

// The locale for formatting dates, e.g. "es-MX".
export function useLocale() {
  return LOCALES[useLanguage()];
}

type WashState = {
  particles: LanguageParticle[];
  origin: { x: number; y: number };
  next: LanguageCode;
};

// initialLanguage comes from the language cookie (read in the root layout),
// so pages render in the chosen language from the first paint.
export function LanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: LanguageCode;
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<LanguageCode>(initialLanguage);
  const [wash, setWash] = useState<WashState | null>(null);

  function handleSelect(code: LanguageCode, origin: { x: number; y: number }) {
    if (code === language) return;
    setWash({
      particles: createLanguageParticles(CHARSETS[code], origin),
      origin,
      next: code,
    });
  }

  function applyLanguage(code: LanguageCode) {
    setLanguage(code);
    document.documentElement.lang = code;
    // Remember it for a year, for server-rendered pages and future visits.
    document.cookie = `${LANGUAGE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <LanguageContext.Provider value={language}>
      <LanguageSwitcher value={language} onSelect={handleSelect} />
      {wash && (
        <LanguageWash
          particles={wash.particles}
          origin={wash.origin}
          onMidpoint={() => applyLanguage(wash.next)}
          onComplete={() => setWash(null)}
        />
      )}
      {children}
    </LanguageContext.Provider>
  );
}
