"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { ArrowUpRight, Check, EyeOff, Plus, Search } from "lucide-react";
import { AddToCalendar } from "@/components/AddToCalendar";
import { DashboardNav } from "@/components/DashboardNav";
import { useLocale, useT } from "@/components/LanguageProvider";
import { hideOrg, saveEvent, unhideOrg, unsaveEvent } from "@/app/actions";
import {
  formatEventDate,
  instagramUrl,
  type BrowseData,
  type OrganizationWithEvents,
} from "@/lib/api";
import { calendarEntry } from "@/lib/calendarLinks";
import { foldForSearch, labelFor, tagLabel, type Messages } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/options";

const PAGE_SIZE = 30;
const MAX_TAGS = 5;
const MAX_EVENTS = 3;

function orgTags(org: OrganizationWithEvents) {
  return [...new Set([...org.interestTags, ...org.hobbyTags])];
}

// Everything a student might type to find an organization, in English and
// in their language.
function searchText(org: OrganizationWithEvents, t: Messages) {
  return foldForSearch(
    [
      org.name,
      org.category,
      org.category && labelFor(t.options.categories, org.category),
      org.cultureTag,
      org.cultureTag && labelFor(t.options.cultures, org.cultureTag),
      ...orgTags(org).flatMap((tag) => [tag, tagLabel(t, tag)]),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

export function BrowseView({ data }: { data: BrowseData }) {
  const t = useT();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [hiddenIds, setHiddenIds] = useState(() => new Set(data.hidden_org_ids));
  const [savedIds, setSavedIds] = useState(() => new Set(data.saved_event_ids));
  const matchedIds = useMemo(() => new Set(data.matched_org_ids), [data]);

  const indexed = useMemo(
    () => data.orgs.map((org) => ({ org, text: searchText(org, t) })),
    [data, t]
  );

  // Matches first, then alphabetical in the student's language.
  const results = useMemo(() => {
    const words = foldForSearch(query).split(/\s+/).filter(Boolean);
    return indexed
      .filter(({ org, text }) => {
        if (category && org.category !== category) return false;
        if (!showHidden && hiddenIds.has(org.id)) return false;
        return words.every((word) => text.includes(word));
      })
      .map(({ org }) => org)
      .sort(
        (a, b) =>
          Number(matchedIds.has(b.id)) - Number(matchedIds.has(a.id)) ||
          a.name.localeCompare(b.name, locale)
      );
  }, [indexed, query, category, showHidden, hiddenIds, matchedIds, locale]);

  // Update the set right away and put it back if the account update fails.
  async function toggle(
    set: Dispatch<SetStateAction<Set<string>>>,
    id: string,
    on: boolean,
    action: (id: string) => Promise<void>
  ) {
    const apply = (value: boolean) =>
      set((prev) => {
        const next = new Set(prev);
        if (value) next.add(id);
        else next.delete(id);
        return next;
      });

    apply(on);
    try {
      await action(id);
    } catch {
      apply(!on);
    }
  }

  function resetPaging<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setVisibleCount(PAGE_SIZE);
    };
  }

  const categoryOptions = [...CATEGORIES].sort((a, b) =>
    labelFor(t.options.categories, a).localeCompare(labelFor(t.options.categories, b), locale)
  );

  return (
    <div className="min-h-screen w-full bg-[#1A1A1A]">
      <DashboardNav active="browse" />

      <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-[#DC143C]">
          {t.browse.title}
        </h1>
        <p className="mt-1 text-sm text-[#8C8785]">{t.browse.subtitle(data.orgs.length)}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-2 rounded-full border border-[#2E2E2E] bg-[#242424] px-4 py-2.5 focus-within:border-[#DC143C]">
            <Search className="h-4 w-4 shrink-0 text-[#8C8785]" />
            <input
              type="search"
              value={query}
              onChange={(e) => resetPaging(setQuery)(e.target.value)}
              placeholder={t.browse.searchPlaceholder}
              aria-label={t.browse.searchPlaceholder}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8C8785]"
            />
          </label>

          <select
            value={category}
            onChange={(e) => resetPaging(setCategory)(e.target.value)}
            aria-label={t.browse.allCategories}
            className="cursor-pointer rounded-full border border-[#2E2E2E] bg-[#242424] px-4 py-2.5 text-sm text-white outline-none focus:border-[#DC143C]"
          >
            <option value="">{t.browse.allCategories}</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {labelFor(t.options.categories, option)}
              </option>
            ))}
          </select>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#8C8785]">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => resetPaging(setShowHidden)(e.target.checked)}
              className="h-4 w-4 accent-[#DC143C]"
            />
            {t.browse.showHidden}
          </label>
        </div>

        <p className="mt-6 mb-3 text-sm text-[#8C8785]" aria-live="polite">
          {t.browse.results(results.length)}
        </p>

        {results.length === 0 ? (
          <p className="rounded-lg border border-[#2E2E2E] bg-black p-6 text-sm text-[#8C8785]">
            {t.browse.noResults}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(0, visibleCount).map((org) => {
              const hidden = hiddenIds.has(org.id);
              return (
                <article
                  key={org.id}
                  className={`relative flex flex-col gap-3 rounded-lg border border-[#2E2E2E] bg-black p-4 ${
                    hidden ? "opacity-60" : ""
                  }`}
                >
                  {hidden ? (
                    <button
                      type="button"
                      onClick={() => toggle(setHiddenIds, org.id, false, unhideOrg)}
                      className="absolute top-3 right-3 cursor-pointer rounded-full border border-[#2E2E2E] px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:border-[#DC143C]"
                    >
                      {t.browse.showAgain}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggle(setHiddenIds, org.id, true, hideOrg)}
                      aria-label={t.common.notInterested}
                      title={t.common.notInterested}
                      className="absolute top-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#8C8785] transition-colors hover:bg-[#2E2E2E] hover:text-white"
                    >
                      <EyeOff className="h-4 w-4" />
                    </button>
                  )}

                  <div className="pr-24">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {matchedIds.has(org.id) && (
                        <span className="rounded-full bg-[#DC143C] px-2 py-0.5 text-[10px] font-semibold text-white">
                          {t.browse.yourMatch}
                        </span>
                      )}
                      {hidden && (
                        <span className="rounded-full bg-[#2E2E2E] px-2 py-0.5 text-[10px] font-semibold text-[#8C8785]">
                          {t.browse.hidden}
                        </span>
                      )}
                      {org.category && (
                        <span className="text-[11px] font-medium text-[#DC143C]">
                          {labelFor(t.options.categories, org.category)}
                        </span>
                      )}
                    </div>
                    <h2 className="font-heading mt-1 text-[15px] font-semibold text-white">
                      {org.name}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {org.cultureTag && (
                      <span className="rounded-full border border-[#DC143C]/40 px-2 py-0.5 text-[11px] text-white">
                        {labelFor(t.options.cultures, org.cultureTag)}
                      </span>
                    )}
                    {orgTags(org)
                      .slice(0, MAX_TAGS)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#2E2E2E] px-2 py-0.5 text-[11px] text-white"
                        >
                          {tagLabel(t, tag)}
                        </span>
                      ))}
                  </div>

                  {org.events.length > 0 && (
                    <div className="flex flex-col gap-2 border-t border-[#2E2E2E] pt-3">
                      <h3 className="text-xs font-semibold text-[#8C8785]">
                        {t.browse.upcomingEvents}
                      </h3>
                      {org.events.slice(0, MAX_EVENTS).map((event) => {
                        const saved = savedIds.has(event.id);
                        return (
                          <div key={event.id} className="flex items-center gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-heading truncate text-sm text-white underline decoration-[#DC143C] underline-offset-2">{event.title}</p>
                              <p className="text-xs text-[#8C8785]">
                                {[formatEventDate(event.start_date, locale), event.start_time]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            </div>
                            <AddToCalendar entry={calendarEntry(event, org.name)} iconOnly />
                            <button
                              type="button"
                              onClick={() =>
                                toggle(setSavedIds, event.id, !saved, saved ? unsaveEvent : saveEvent)
                              }
                              aria-label={saved ? t.saved.remove : t.common.saveEvent}
                              title={saved ? t.saved.remove : t.common.saveEvent}
                              aria-pressed={saved}
                              className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${
                                saved
                                  ? "bg-[#2E2E2E] text-white hover:bg-[#3a3a3a]"
                                  : "bg-[#DC143C] text-white hover:bg-[#a90d26]"
                              }`}
                            >
                              {saved ? (
                                <Check className="h-4 w-4" strokeWidth={3} />
                              ) : (
                                <Plus className="h-4 w-4" strokeWidth={3} />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {org.instagramUsername && (
                    <a
                      href={instagramUrl(org.instagramUsername)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto flex w-fit items-center gap-0.5 text-xs text-[#DC143C] transition-colors hover:text-[#a90d26]"
                    >
                      @{org.instagramUsername}
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {results.length > visibleCount && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="cursor-pointer rounded-full border border-[#DC143C]/30 bg-black px-6 py-2.5 text-sm font-semibold text-[#DC143C] transition-colors hover:border-[#DC143C]"
            >
              {t.browse.showMore}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
