"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { DashboardNav } from "@/components/DashboardNav";
import { ScrollProgressRail } from "@/components/ScrollProgressRail";
import { MotionPathTrail } from "@/components/MotionPathTrail";
import { Doors } from "@/components/effects/Doors";
import { saveEvent } from "@/app/actions";
import type { Dashboard } from "@/lib/api";
import { matchColors } from "@/lib/matchColors";
import { EventTile } from "./EventTile";
import { OrgTile } from "./OrgTile";
import { SavedEventToast } from "./SavedEventToast";

const MAX_EVENTS = 6;

export function HomePage({
  firstName,
  dashboard,
}: {
  firstName: string;
  dashboard: Dashboard;
}) {
  const { profile, recommendations, suggestions } = dashboard;
  const colors = matchColors(dashboard);
  const matches = [...recommendations, ...suggestions];

  const [revealed, setRevealed] = useState(false);
  const [savedIds, setSavedIds] = useState(
    () => new Set(dashboard.saved_events.map((event) => event.id))
  );
  const [toastOpen, setToastOpen] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

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

  function showToast(failed: boolean) {
    setToastOpen(false);
    // Re-open on the next tick so Radix always plays the enter animation,
    // even if a toast from a previous save is still open/closing.
    requestAnimationFrame(() => {
      setSaveFailed(failed);
      setToastOpen(true);
    });
  }

  async function handleSave(eventId: string) {
    setSavedIds((prev) => new Set(prev).add(eventId));
    showToast(false);

    try {
      await saveEvent(eventId);
    } catch {
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      showToast(true);
    }
  }

  const summary = [profile?.major, profile?.class_year].filter(Boolean).join(" · ");

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
              Welcome back, {firstName}
            </div>
            {summary && (
              <p className="mt-1 text-sm text-[#8C8785]">{summary}</p>
            )}
          </div>
          <Link
            href="/majClass"
            className="text-sm font-semibold text-[#8C8785] transition-colors hover:text-[#DC143C]"
          >
            Edit your answers
          </Link>
        </div>

        <section className="relative">
          <h2 className="font-heading mb-4 text-lg font-semibold text-white">
            Your Top Matches
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:grid-rows-2">
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
                />
              </div>
            ))}
            <ScrollProgressRail className="hidden sm:col-start-5 sm:row-start-2 sm:block sm:self-center" />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-heading mb-4 text-lg font-semibold text-white">
            Upcoming Events For You
          </h2>
          {events.length === 0 ? (
            <p className="rounded-lg border border-[#2E2E2E] bg-black p-6 text-sm text-[#8C8785]">
              None of your matches have posted upcoming events yet. Check back
              soon.
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
            <h2 className="font-heading mb-4 text-lg font-semibold text-white">
              Suggested for you
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {suggestions.map((match) => (
                <div key={match.org_id} className="sm:min-h-[174px]">
                  <OrgTile match={match} color={colors.get(match.org_id)} />
                </div>
              ))}
            </div>
          </section>
        )}
      </motion.div>

      <SavedEventToast
        open={toastOpen}
        failed={saveFailed}
        onOpenChange={setToastOpen}
      />
    </div>
  );
}
