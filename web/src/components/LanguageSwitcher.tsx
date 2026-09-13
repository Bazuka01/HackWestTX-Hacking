"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n";

const DASHBOARD_ROUTES = ["/homePage", "/calendar", "/savedEvents", "/browse"];

export function LanguageSwitcher({
  value,
  onSelect,
}: {
  value: LanguageCode;
  onSelect: (code: LanguageCode, origin: { x: number; y: number }) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const current = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];
  const isDashboard = DASHBOARD_ROUTES.some((route) =>
    pathname?.startsWith(route)
  );

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
          aria-label={current.label}
          className={
            isDashboard
              ? "fixed top-6 right-6 z-40 flex cursor-pointer items-center gap-2 rounded-full border border-[#2E2E2E] bg-[#1A1A1A] px-4 py-2 text-sm text-[#F2F0EE] outline-none transition-colors hover:border-[#C8102E]"
              : "fixed top-6 right-6 z-40 flex cursor-pointer items-center gap-2 rounded-full border border-slate-500/15 bg-orange-200 px-4 py-2 text-sm text-slate-500 outline-none transition-colors hover:border-slate-500/40"
          }
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
          {/* Icon only on phones, so the dashboard nav has room. */}
          <span className="hidden sm:inline">{current.label}</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={
            isDashboard
              ? "z-40 min-w-[10rem] overflow-hidden rounded-2xl border border-[#2E2E2E] bg-[#1A1A1A] py-1 shadow-lg"
              : "z-40 min-w-[10rem] overflow-hidden rounded-2xl border border-slate-500/10 bg-orange-200 py-1 shadow-lg"
          }
        >
          {LANGUAGES.map((lang) => (
            <DropdownMenu.Item
              key={lang.code}
              onSelect={() => handleSelect(lang.code)}
              className={
                isDashboard
                  ? "cursor-pointer px-4 py-2 text-sm text-[#F2F0EE] outline-none data-[highlighted]:bg-[#C8102E]/20"
                  : "cursor-pointer px-4 py-2 text-sm text-slate-500 outline-none data-[highlighted]:bg-slate-500/5"
              }
            >
              {lang.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
