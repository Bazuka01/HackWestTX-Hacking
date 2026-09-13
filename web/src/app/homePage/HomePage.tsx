"use client";

import { useState } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import { RECOMMENDED_EVENTS, type RecommendedEvent } from "@/lib/events";
import { useSavedEvents } from "@/lib/useSavedEvents";
import { EventTile } from "./EventTile";
import { SavedEventToast } from "./SavedEventToast";

const BENTO_EVENTS = RECOMMENDED_EVENTS.slice(0, 4);
const MORE_EVENTS = RECOMMENDED_EVENTS.slice(4, 7);

export function HomePage({ user }: { user?: { name: string } }) {
  const displayUser = user ?? { name: "Jordan" };
  const { events: saved, save } = useSavedEvents();
  const [toastOpen, setToastOpen] = useState(false);

  function isSaved(id: string) {
    return saved.some((e) => e.id === id);
  }

  function handleSave(event: RecommendedEvent) {
    save({
      id: event.id,
      orgId: event.orgId,
      org: event.org,
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
    });
    setToastOpen(false);
    // Re-open on the next tick so Radix always plays the enter animation,
    // even if a toast from a previous save is still open/closing.
    requestAnimationFrame(() => setToastOpen(true));
  }

  return (
    <div className="min-h-screen w-full bg-[#0D0D0D]">
      <DashboardNav active="home" />

      <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
        <div className="mb-8 text-2xl font-bold tracking-tight text-[#F2F0EE]">
          Welcome back, {displayUser.name}
        </div>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-[#F2F0EE]">
            Your Top Matches
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:grid-rows-2">
            <div className="sm:col-span-2 sm:row-span-2 sm:min-h-[364px]">
              <EventTile
                event={BENTO_EVENTS[0]}
                featured
                isSaved={isSaved(BENTO_EVENTS[0].id)}
                onSave={() => handleSave(BENTO_EVENTS[0])}
              />
            </div>
            <div className="sm:col-span-2 sm:min-h-[174px]">
              <EventTile
                event={BENTO_EVENTS[1]}
                isSaved={isSaved(BENTO_EVENTS[1].id)}
                onSave={() => handleSave(BENTO_EVENTS[1])}
              />
            </div>
            <div className="sm:min-h-[174px]">
              <EventTile
                event={BENTO_EVENTS[2]}
                isSaved={isSaved(BENTO_EVENTS[2].id)}
                onSave={() => handleSave(BENTO_EVENTS[2])}
              />
            </div>
            <div className="sm:min-h-[174px]">
              <EventTile
                event={BENTO_EVENTS[3]}
                isSaved={isSaved(BENTO_EVENTS[3].id)}
                onSave={() => handleSave(BENTO_EVENTS[3])}
              />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-[#F2F0EE]">
            More For You
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {MORE_EVENTS.map((event) => (
              <div key={event.id} className="sm:min-h-[174px]">
                <EventTile
                  event={event}
                  isSaved={isSaved(event.id)}
                  onSave={() => handleSave(event)}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <SavedEventToast open={toastOpen} onOpenChange={setToastOpen} />
    </div>
  );
}
