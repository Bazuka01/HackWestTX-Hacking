"use client";

import { Check, Plus } from "lucide-react";
import { AddToCalendar } from "@/components/AddToCalendar";
import { useLocale, useT } from "@/components/LanguageProvider";
import { formatEventDate, type OrgEvent } from "@/lib/api";
import { calendarEntry } from "@/lib/calendarLinks";

export function EventTile({
  event,
  orgName,
  featured,
  isSaved,
  onSave,
}: {
  event: OrgEvent;
  orgName: string;
  featured?: boolean;
  isSaved: boolean;
  onSave: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const details = [
    formatEventDate(event.start_date, locale),
    event.start_time,
    event.location ?? t.common.locationTba,
  ].filter(Boolean);

  return (
    <div
      className={`relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-[#2E2E2E] bg-black transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] ${
        featured ? "p-6" : "p-4"
      }`}
    >
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <AddToCalendar entry={calendarEntry(event, orgName)} iconOnly />
        <button
          type="button"
          onClick={onSave}
          disabled={isSaved}
          aria-label={isSaved ? t.common.alreadySaved : t.common.saveEvent}
          title={isSaved ? t.common.alreadySaved : t.common.saveEvent}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            isSaved
              ? "cursor-default bg-[#2E2E2E] text-[#8C8785]"
              : "cursor-pointer bg-[#DC143C] text-white hover:bg-[#a90d26]"
          }`}
        >
          {isSaved ? (
            <Check className="h-4 w-4" strokeWidth={3} />
          ) : (
            <Plus className="h-4 w-4" strokeWidth={3} />
          )}
        </button>
      </div>

      <div>
        <div className="mb-2 max-w-[calc(100%-4.5rem)] truncate text-[11px] font-medium text-white">
          {orgName}
        </div>
        <div
          className={`font-heading pr-16 font-semibold text-white underline decoration-[#DC143C] decoration-2 underline-offset-2 ${
            featured ? "text-xl" : "text-[15px]"
          }`}
        >
          {event.source_url ? (
            <a
              href={event.source_url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#DC143C]"
            >
              {event.title}
            </a>
          ) : (
            event.title
          )}
        </div>
      </div>

      <div className="mt-3 text-xs text-white/70">{details.join(" · ")}</div>
    </div>
  );
}
