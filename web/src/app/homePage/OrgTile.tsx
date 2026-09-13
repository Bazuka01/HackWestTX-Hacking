"use client";

import { ArrowUpRight, EyeOff, Pin } from "lucide-react";
import { useLocale, useT } from "@/components/LanguageProvider";
import { formatEventDate, instagramUrl, type Match } from "@/lib/api";
import { labelFor } from "@/lib/i18n";

// An organization on the home page: why it fits, plus its next event.
export function OrgTile({
  match,
  featured,
  kept = false,
  added = false,
  onToggleKeep,
  onHide,
}: {
  match: Match;
  featured?: boolean;
  // Kept tiles stay when the student gets new picks.
  kept?: boolean;
  // Added from Browse; un-keeping removes it from the home page.
  added?: boolean;
  // The Keep and "Not interested" buttons are left out when these aren't passed.
  onToggleKeep?: () => void;
  onHide?: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const { organization, reason, events } = match;
  const nextEvent = events[0];
  const hasActions = Boolean(onToggleKeep || onHide);
  const keepHint = kept ? (added ? t.home.removeFromHome : t.common.kept) : t.common.keep;

  return (
    <div
      className={`relative flex h-full flex-col justify-between overflow-hidden rounded-lg border bg-black transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] ${
        kept ? "border-[#DC143C]/50" : "border-[#2E2E2E]"
      } ${featured ? "p-6" : "p-4"}`}
    >
      {hasActions && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {onToggleKeep && (
            <button
              type="button"
              onClick={onToggleKeep}
              aria-pressed={kept}
              aria-label={keepHint}
              title={keepHint}
              className={`flex h-7 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition-colors ${
                kept
                  ? "bg-[#DC143C] text-white hover:bg-[#a90d26]"
                  : "border border-[#2E2E2E] text-[#8C8785] hover:border-[#DC143C] hover:text-white"
              }`}
            >
              <Pin className={`h-3.5 w-3.5 ${kept ? "fill-current" : ""}`} />
              {kept ? t.common.kept : t.common.keep}
            </button>
          )}
          {onHide && (
            <button
              type="button"
              onClick={onHide}
              aria-label={t.common.notInterested}
              title={t.common.notInterested}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#8C8785] transition-colors hover:bg-[#2E2E2E] hover:text-white"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div className={hasActions ? "pr-28" : ""}>
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
          {reason ?? t.home.addedReason}
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
