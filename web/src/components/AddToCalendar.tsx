"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CalendarPlus } from "lucide-react";
import { useT } from "@/components/LanguageProvider";
import {
  downloadIcs,
  googleCalendarUrl,
  type CalendarEntry,
} from "@/lib/calendarLinks";

// A button that offers Google Calendar or an .ics download for one event.
// iconOnly fits it into small tiles; variant matches the page's theme.
export function AddToCalendar({
  entry,
  iconOnly = false,
  variant = "dark",
}: {
  entry: CalendarEntry;
  iconOnly?: boolean;
  variant?: "dark" | "light";
}) {
  const t = useT();
  const dark = variant === "dark";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t.event.addToCalendar}
          title={t.event.addToCalendar}
          className={
            iconOnly
              ? `flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors ${
                  dark
                    ? "bg-[#2E2E2E] text-[#F2F0EE] hover:bg-[#3a3a3a]"
                    : "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20"
                }`
              : `flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border py-2.5 text-sm font-semibold transition-colors ${
                  dark
                    ? "border-[#2E2E2E] text-[#F2F0EE] hover:border-[#C8102E]"
                    : "border-slate-500/30 text-slate-600 hover:border-slate-500"
                }`
          }
        >
          <CalendarPlus className="h-4 w-4" />
          {!iconOnly && t.event.addToCalendar}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className={`z-50 min-w-[12rem] overflow-hidden rounded-xl border py-1 shadow-lg ${
            dark ? "border-[#2E2E2E] bg-[#1A1A1A]" : "border-slate-500/10 bg-orange-50"
          }`}
        >
          {[
            {
              label: t.event.googleCalendar,
              onSelect: () => window.open(googleCalendarUrl(entry), "_blank", "noopener"),
            },
            { label: t.event.downloadIcs, onSelect: () => downloadIcs(entry) },
          ].map((item) => (
            <DropdownMenu.Item
              key={item.label}
              onSelect={item.onSelect}
              className={`cursor-pointer px-4 py-2 text-sm outline-none ${
                dark
                  ? "text-[#F2F0EE] data-[highlighted]:bg-[#C8102E]/20"
                  : "text-slate-600 data-[highlighted]:bg-slate-500/5"
              }`}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
