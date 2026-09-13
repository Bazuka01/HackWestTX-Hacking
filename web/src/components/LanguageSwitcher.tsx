"use client";

import { useRef } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n";

export function LanguageSwitcher({
  value,
  onSelect,
}: {
  value: LanguageCode;
  onSelect: (code: LanguageCode, origin: { x: number; y: number }) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

  function handleSelect(code: LanguageCode) {
    const rect = triggerRef.current?.getBoundingClientRect();
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: window.innerWidth - 80, y: 40 };
    onSelect(code, origin);
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className="fixed top-3 right-6 z-40 flex cursor-pointer items-center gap-2 rounded-full border border-[#DC143C]/30 bg-black px-4 py-2 text-sm text-[#DC143C] outline-none transition-colors hover:border-[#DC143C]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-4 w-4"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
          {current.label}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-40 min-w-[10rem] overflow-hidden rounded-2xl border border-[#DC143C]/20 bg-black py-1 shadow-lg"
        >
          {LANGUAGES.map((lang) => (
            <DropdownMenu.Item
              key={lang.code}
              onSelect={() => handleSelect(lang.code)}
              className="cursor-pointer px-4 py-2 text-sm text-[#DC143C] outline-none data-[highlighted]:bg-[#DC143C]/15"
            >
              {lang.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
