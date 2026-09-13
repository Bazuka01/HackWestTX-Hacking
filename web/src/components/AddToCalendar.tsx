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
// iconOnly fits it into small tiles.
export function AddToCalendar({
  entry,
  iconOnly = false,
}: {
  entry: CalendarEntry;
  iconOnly?: boolean;
}) {
  const t = useT();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t.event.addToCalendar}
          title={t.event.addToCalendar}
          className={
            iconOnly
              ? "flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#2E2E2E] text-white transition-colors hover:bg-[#3a3a3a]"
              : "flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#2E2E2E] py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#DC143C]"
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
          className="z-50 min-w-[12rem] overflow-hidden rounded-xl border border-[#2E2E2E] bg-[#242424] py-1 shadow-lg"
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
              className="cursor-pointer px-4 py-2 text-sm text-white outline-none data-[highlighted]:bg-[#DC143C]/20"
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
