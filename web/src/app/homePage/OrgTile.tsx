"use client";

import { ArrowUpRight, EyeOff } from "lucide-react";
import { useLocale, useT } from "@/components/LanguageProvider";
import { formatEventDate, instagramUrl, type Match } from "@/lib/api";
import { labelFor } from "@/lib/i18n";

// A matched organization: why it fits, plus its next event.
export function OrgTile({
  match,
  featured,
  onHide,
}: {
  match: Match;
  featured?: boolean;
  // "Not interested"; the button is left out when this isn't passed.
  onHide?: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const { organization, reason, events } = match;
  const nextEvent = events[0];

  return (
    <div
      className={`relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-[#2E2E2E] bg-black transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] ${
        featured ? "p-6" : "p-4"
      }`}
    >
      {onHide && (
        <button
          type="button"
          onClick={onHide}
          aria-label={t.common.notInterested}
          title={t.common.notInterested}
          className="absolute top-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#8C8785] transition-colors hover:bg-[#2E2E2E] hover:text-white"
        >
          <EyeOff className="h-4 w-4" />
        </button>
      )}

      <div className={onHide ? "pr-8" : ""}>
        <div
          className={`font-heading font-semibold text-white ${
            featured ? "text-xl" : "text-[15px]"
          }`}
        >
          {organization.name}
        </div>
        {organization.category && (
          <div className="mt-1 text-[11px] font-medium text-[#DC143C]">
            {labelFor(t.options.categories, organization.category)}
          </div>
        )}
        <p className={`mt-2 text-white/70 ${featured ? "text-sm" : "text-xs"}`}>
          {reason}
        </p>
        {featured && organization.meetingTime && (
          <p className="mt-2 text-sm text-white/70">
            {t.home.meets(organization.meetingTime)}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-white/70">
        <span>
          {nextEvent
            ? t.home.nextEvent(formatEventDate(nextEvent.start_date, locale), nextEvent.title)
            : t.home.noUpcoming}
        </span>
        {organization.instagramUsername && (
          <a
            href={instagramUrl(organization.instagramUsername)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-0.5 text-[#DC143C] transition-colors hover:text-[#a90d26]"
          >
            @{organization.instagramUsername}
            <ArrowUpRight className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
