"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { Doors } from "@/components/effects/Doors";
import { useT } from "@/components/LanguageProvider";
import { MotionPathTrail } from "@/components/MotionPathTrail";
import { ScrollProgressRail } from "@/components/ScrollProgressRail";
import {
  getNewPicks,
  hideOrg,
  keepOrg,
  saveEvent,
  unhideOrg,
  unkeepOrg,
} from "@/app/actions";
import type { Dashboard } from "@/lib/api";
import { labelFor } from "@/lib/i18n";
import { EventTile } from "./EventTile";
import { NoticeToast, type Notice } from "./NoticeToast";
import { OrgTile } from "./OrgTile";

const MAX_EVENTS = 6;

export function HomePage({
  firstName,
  dashboard,
}: {
  firstName: string;
  dashboard: Dashboard;
}) {
  const t = useT();
  const { profile } = dashboard;

  const [revealed, setRevealed] = useState(false);
  const [savedIds, setSavedIds] = useState(
    () => new Set(dashboard.saved_events.map((event) => event.id))
  );
  // Organizations marked "Not interested" on this visit, hidden right away.
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  // Kept organizations stay when new picks come in.
  const [keptIds, setKeptIds] = useState(
    () =>
      new Set(
        [...dashboard.recommendations, ...dashboard.suggestions, ...dashboard.added]
          .filter((match) => match.kept)
          .map((match) => match.org_id)
      )
  );
  const [notice, setNotice] = useState<Notice | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [findingPicks, startFindingPicks] = useTransition();
  const [picksFailed, setPicksFailed] = useState(false);

  const visible = (match: { org_id: string }) => !hiddenIds.has(match.org_id);
  const recommendations = dashboard.recommendations.filter(visible);
  const suggestions = dashboard.suggestions.filter(visible);
  // Added organizations leave the page as soon as they're un-kept.
  const added = dashboard.added.filter(
    (match) => visible(match) && keptIds.has(match.org_id)
  );
  const matches = [...recommendations, ...added, ...suggestions];

  // Upcoming events from every matched organization, soonest first.
  const events = matches
    .flatMap((match) =>
      match.events.map((event) => ({ event, organization: match.organization }))
    )
    .sort(
      (a, b) =>
        a.event.start_date.localeCompare(b.event.start_date) ||
        a.event.id.localeCompare(b.event.id)
    )
    .slice(0, MAX_EVENTS);

  function showNotice(next: Notice) {
    setToastOpen(false);
    // Re-open on the next tick so Radix always plays the enter animation,
    // even if a previous toast is still open/closing.
    requestAnimationFrame(() => {
      setNotice(next);
      setToastOpen(true);
    });
  }

  function toggleIn(
    set: typeof setHiddenIds,
    orgId: string,
    on: boolean
  ) {
    set((prev) => {
      const next = new Set(prev);
      if (on) next.add(orgId);
      else next.delete(orgId);
      return next;
    });
  }

  function setHidden(orgId: string, hidden: boolean) {
    toggleIn(setHiddenIds, orgId, hidden);
  }

  async function handleToggleKeep(orgId: string) {
    const keep = !keptIds.has(orgId);
    toggleIn(setKeptIds, orgId, keep);
    if (keep) {
      showNotice({ tone: "success", title: t.home.keptTitle, description: t.home.keptDescription });
    }

    try {
      await (keep ? keepOrg(orgId) : unkeepOrg(orgId));
    } catch {
      toggleIn(setKeptIds, orgId, !keep);
    }
  }

  async function handleSave(eventId: string) {
    setSavedIds((prev) => new Set(prev).add(eventId));
    showNotice({ tone: "success", title: t.home.eventSaved, description: t.home.eventSavedHint });

    try {
      await saveEvent(eventId);
    } catch {
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      showNotice({ tone: "error", title: t.home.saveFailed, description: t.home.saveFailedHint });
    }
  }

  // Hiding also un-keeps the organization (the account does the same).
  async function handleHide(orgId: string) {
    setHidden(orgId, true);
    toggleIn(setKeptIds, orgId, false);
    showNotice({
      tone: "hidden",
      title: t.home.hiddenTitle,
      description: t.home.hiddenDescription,
      action: { label: t.common.undo, onClick: () => handleUndoHide(orgId) },
    });

    try {
      await hideOrg(orgId);
    } catch {
      setHidden(orgId, false);
    }
  }

  async function handleUndoHide(orgId: string) {
    setToastOpen(false);
    setHidden(orgId, false);

    try {
      await unhideOrg(orgId);
    } catch {
      setHidden(orgId, true);
    }
  }

  // The action refreshes this page with the new matches when it finishes.
  function handleNewPicks() {
    setPicksFailed(false);
    startFindingPicks(async () => {
      try {
        await getNewPicks();
        setHiddenIds(new Set());
      } catch {
        setPicksFailed(true);
      }
    });
  }

  const summary = [
    profile?.major && labelFor(t.options.majors, profile.major),
    profile?.class_year && labelFor(t.options.classYears, profile.class_year),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen w-full bg-[#1A1A1A]">
      <Doors variant="in" onComplete={() => setRevealed(true)} />
      <DashboardNav active="home" />

      <motion.div
        className="relative mx-auto max-w-5xl px-6 pt-28 pb-16"
        initial={{ opacity: 0, y: 8 }}
        animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <MotionPathTrail />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-heading text-4xl font-extrabold tracking-tight text-[#DC143C]">
              {t.home.welcome(firstName)}
            </div>
            {summary && (
              <p className="mt-1 text-sm text-[#8C8785]">{summary}</p>
            )}
          </div>
          <Link
            href="/majClass"
            className="text-sm font-semibold text-[#8C8785] transition-colors hover:text-[#DC143C]"
          >
            {t.home.editAnswers}
          </Link>
        </div>

        <section className="relative">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-white">
              {t.home.topMatches}
            </h2>
            <button
              type="button"
              onClick={handleNewPicks}
              disabled={findingPicks}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-[#DC143C]/30 bg-black px-4 py-2 text-sm font-semibold text-[#DC143C] transition-colors hover:border-[#DC143C] disabled:cursor-wait disabled:opacity-70"
            >
              <motion.span
                animate={findingPicks ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  findingPicks
                    ? { repeat: Infinity, duration: 0.9, ease: "linear" }
                    : { duration: 0 }
                }
              >
                <RefreshCw className="h-4 w-4" />
              </motion.span>
              {findingPicks ? t.home.findingPicks : t.home.newPicks}
            </button>
          </div>

          {picksFailed && (
            <p className="mb-4 text-sm text-[#EF4444]">{t.home.newPicksError}</p>
          )}

          {recommendations.length === 0 ? (
            <p className="rounded-lg border border-[#2E2E2E] bg-black p-6 text-sm text-[#8C8785]">
              {t.home.allHidden}
            </p>
          ) : (
            <div
              className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:grid-rows-2 ${
                findingPicks ? "opacity-50" : ""
              }`}
            >
              {recommendations.map((match, i) => (
                <div
                  key={match.org_id}
                  className={
                    i === 0
                      ? "sm:col-span-2 sm:row-span-2 sm:min-h-[364px]"
                      : "sm:col-span-2 sm:min-h-[174px]"
                  }
                >
                  <OrgTile
                    match={match}
                    featured={i === 0}
                    kept={keptIds.has(match.org_id)}
                    onToggleKeep={() => handleToggleKeep(match.org_id)}
                    onHide={() => handleHide(match.org_id)}
                  />
                </div>
              ))}
              <ScrollProgressRail className="hidden sm:col-start-5 sm:row-start-2 sm:block sm:self-center" />
            </div>
          )}
        </section>

        {added.length > 0 && (
          <section className="mt-10">
            <h2 className="font-heading mb-4 text-lg font-semibold text-white">
              {t.home.addedByYou}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {added.map((match) => (
                <div key={match.org_id} className="sm:min-h-[174px]">
                  <OrgTile
                    match={match}
                    kept
                    added
                    onToggleKeep={() => handleToggleKeep(match.org_id)}
                    onHide={() => handleHide(match.org_id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="font-heading mb-4 text-lg font-semibold text-white">
            {t.home.eventsForYou}
          </h2>
          {events.length === 0 ? (
            <p className="rounded-lg border border-[#2E2E2E] bg-black p-6 text-sm text-[#8C8785]">
              {t.home.noEvents}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {events.map(({ event, organization }) => (
                <div key={event.id} className="sm:min-h-[174px]">
                  <EventTile
                    event={event}
                    orgName={organization.name}
                    isSaved={savedIds.has(event.id)}
                    onSave={() => handleSave(event.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {suggestions.length > 0 && (
          <section className="mt-10">
            <h2 className="font-heading mb-4 text-lg font-semibold text-white">
              {t.home.moreForYou}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {suggestions.map((match) => (
                <div key={match.org_id} className="sm:min-h-[174px]">
                  <OrgTile
                    match={match}
                    kept={keptIds.has(match.org_id)}
                    onToggleKeep={() => handleToggleKeep(match.org_id)}
                    onHide={() => handleHide(match.org_id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </motion.div>

      <NoticeToast notice={notice} open={toastOpen} onOpenChange={setToastOpen} />
    </div>
  );
}
