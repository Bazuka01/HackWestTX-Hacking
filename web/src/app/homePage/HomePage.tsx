"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { useT } from "@/components/LanguageProvider";
import { getNewPicks, hideOrg, saveEvent, unhideOrg } from "@/app/actions";
import type { Dashboard } from "@/lib/api";
import { labelFor } from "@/lib/i18n";
import { matchColors } from "@/lib/matchColors";
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
  const colors = matchColors(dashboard);

  const [savedIds, setSavedIds] = useState(
    () => new Set(dashboard.saved_events.map((event) => event.id))
  );
  // Organizations marked "Not interested" on this visit, hidden right away.
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [findingPicks, startFindingPicks] = useTransition();
  const [picksFailed, setPicksFailed] = useState(false);

  const visible = (match: { org_id: string }) => !hiddenIds.has(match.org_id);
  const recommendations = dashboard.recommendations.filter(visible);
  const suggestions = dashboard.suggestions.filter(visible);
  const matches = [...recommendations, ...suggestions];

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

  function setHidden(orgId: string, hidden: boolean) {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (hidden) next.add(orgId);
      else next.delete(orgId);
      return next;
    });
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

  async function handleHide(orgId: string) {
    setHidden(orgId, true);
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
    <div className="min-h-screen w-full bg-[#0D0D0D]">
      <DashboardNav active="home" />

      <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#F2F0EE]">
              {t.home.welcome(firstName)}
            </div>
            {summary && (
              <p className="mt-1 text-sm text-[#8C8785]">{summary}</p>
            )}
          </div>
          <Link
            href="/majClass"
            className="text-sm font-semibold text-[#8C8785] transition-colors hover:text-[#C8102E]"
          >
            {t.home.editAnswers}
          </Link>
        </div>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#F2F0EE]">
              {t.home.topMatches}
            </h2>
            <button
              type="button"
              onClick={handleNewPicks}
              disabled={findingPicks}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-[#2E2E2E] bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-[#F2F0EE] transition-colors hover:border-[#C8102E] disabled:cursor-wait disabled:opacity-70"
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
            <p className="mb-4 text-sm text-[#C8102E]">{t.home.newPicksError}</p>
          )}

          {recommendations.length === 0 ? (
            <p className="rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] p-6 text-sm text-[#8C8785]">
              {t.home.allHidden}
            </p>
          ) : (
            <div
              className={`grid grid-cols-1 gap-4 sm:grid-cols-4 sm:grid-rows-2 transition-opacity ${
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
                    color={colors.get(match.org_id)}
                    featured={i === 0}
                    onHide={() => handleHide(match.org_id)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-[#F2F0EE]">
            {t.home.eventsForYou}
          </h2>
          {events.length === 0 ? (
            <p className="rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] p-6 text-sm text-[#8C8785]">
              {t.home.noEvents}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {events.map(({ event, organization }) => (
                <div key={event.id} className="sm:min-h-[174px]">
                  <EventTile
                    event={event}
                    orgName={organization.name}
                    orgColor={colors.get(organization.id)}
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
            <h2 className="mb-4 text-lg font-semibold text-[#F2F0EE]">
              {t.home.moreForYou}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {suggestions.map((match) => (
                <div key={match.org_id} className="sm:min-h-[174px]">
                  <OrgTile
                    match={match}
                    color={colors.get(match.org_id)}
                    onHide={() => handleHide(match.org_id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <NoticeToast notice={notice} open={toastOpen} onOpenChange={setToastOpen} />
    </div>
  );
}
