"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  LanguageWash,
  createLanguageParticles,
  type LanguageParticle,
} from "@/components/effects/LanguageWash";
import { CHARSETS, type LanguageCode } from "@/lib/i18n";

const LanguageContext = createContext<LanguageCode>("en");

export function useLanguage() {
  return useContext(LanguageContext);
}

type WashState = {
  particles: LanguageParticle[];
  origin: { x: number; y: number };
  next: LanguageCode;
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [wash, setWash] = useState<WashState | null>(null);

  function handleSelect(code: LanguageCode, origin: { x: number; y: number }) {
    if (code === language) return;
    setWash({
      particles: createLanguageParticles(CHARSETS[code], origin),
      origin,
      next: code,
    });
  }

  return (
    <LanguageContext.Provider value={language}>
      <LanguageSwitcher value={language} onSelect={handleSelect} />
      {wash && (
        <LanguageWash
          particles={wash.particles}
          origin={wash.origin}
          onMidpoint={() => setLanguage(wash.next)}
          onComplete={() => setWash(null)}
        />
      )}
      {children}
    </LanguageContext.Provider>
  );
}
