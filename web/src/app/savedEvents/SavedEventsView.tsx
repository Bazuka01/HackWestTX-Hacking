"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import gsap from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ChevronDown } from "lucide-react";
import { calendarEntry } from "@/lib/calendarLinks";
import { DashboardNav } from "@/components/DashboardNav";
import {
  EventDetailsDialog,
  type EventDetails,
} from "@/components/EventDetailsDialog";
import { useLocale, useT } from "@/components/LanguageProvider";
import { unsaveEvent } from "@/app/actions";
import { formatEventDate, type SavedEvent } from "@/lib/api";

gsap.registerPlugin(InertiaPlugin);

// The events saved to the student's account, soonest first.
export function SavedEventsView({ savedEvents }: { savedEvents: SavedEvent[] }) {
  const t = useT();
  const locale = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const events = useMemo(
    () => savedEvents.filter((event) => !removedIds.has(event.id)),
    [savedEvents, removedIds]
  );

  // Hide the event right away; bring it back if the account update fails.
  async function handleRemove(eventId: string) {
    setSelectedEvent(null);
    setRemovedIds((prev) => new Set(prev).add(eventId));

    try {
      await unsaveEvent(eventId);
    } catch {
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }
  }

  // Hover inertia effect adapted from https://madewithgsap.com/effects/free-tutorial001
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let oldX = 0;
    let oldY = 0;
    let deltaX = 0;
    let deltaY = 0;

    function handleMouseMove(e: MouseEvent) {
      deltaX = e.clientX - oldX;
      deltaY = e.clientY - oldY;
      oldX = e.clientX;
      oldY = e.clientY;
    }

    const cards = Array.from(root.querySelectorAll<HTMLElement>(".event-card"));
    const cleanups: (() => void)[] = [];

    cards.forEach((card) => {
      function handleEnter() {
        const tl = gsap.timeline({
          onComplete: () => tl.kill(),
        });
        tl.timeScale(1.2);
        tl.to(card, {
          inertia: {
            x: { velocity: deltaX * 30, end: 0 },
            y: { velocity: deltaY * 30, end: 0 },
          },
        });
        tl.fromTo(
          card,
          { rotate: 0 },
          {
            duration: 0.4,
            rotate: (Math.random() - 0.5) * 12,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
          },
          "<"
        );
      }
      card.addEventListener("mouseenter", handleEnter);
      cleanups.push(() => card.removeEventListener("mouseenter", handleEnter));
    });

    root.addEventListener("mousemove", handleMouseMove);
    cleanups.push(() => root.removeEventListener("mousemove", handleMouseMove));

    return () => cleanups.forEach((fn) => fn());
    // Events arrive after the first render, so re-attach once the cards exist.
  }, [events]);

  // Show a scroll arrow only while there's more content below the fold.
  useEffect(() => {
    function checkScroll() {
      const scrollHeight = document.documentElement.scrollHeight;
      const hasOverflow = scrollHeight > window.innerHeight + 24;
      const atBottom = window.innerHeight + window.scrollY >= scrollHeight - 24;
      setShowScrollArrow(hasOverflow && !atBottom);
    }

    checkScroll();
    window.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      window.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [events]);

  function scrollMore() {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
  }

  return (
    <div ref={rootRef} className="relative min-h-screen w-full bg-[#0D0D0D]">
      <DashboardNav active="saved" />

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 pt-28 pb-16">
        <h1 className="text-3xl font-semibold tracking-tight text-[#F2F0EE]">
          {t.saved.title}
        </h1>

        {events.length === 0 && (
          <EmptyState
            message={t.saved.empty}
            href="/homePage"
            linkLabel={t.saved.findEvents}
          />
        )}

        {events.length > 0 && (
          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {events.map((event) => {
              const date = formatEventDate(event.start_date, locale);
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEvent(calendarEntry(event, event.org_name))}
                  className="event-card relative flex aspect-square cursor-pointer flex-col justify-between rounded-2xl border border-[#2E2E2E] bg-[#1A1A1A] p-4 text-left transition-colors hover:border-[#C8102E]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#F2F0EE]">
                      {event.title}
                    </p>
                    <p className="mt-1 text-xs text-[#8C8785]">
                      {event.org_name}
                    </p>
                    <p className="mt-1 text-xs text-[#8C8785]">
                      {event.location ?? t.common.locationTba}
                    </p>
                  </div>
                  <p className="text-xs text-[#8C8785]">
                    {event.start_time ? `${date} · ${event.start_time}` : date}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showScrollArrow && (
          <motion.button
            type="button"
            onClick={scrollMore}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 z-30 flex h-10 w-10 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full bg-[#C8102E] text-white shadow-lg"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <EventDetailsDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRemove={handleRemove}
      />
    </div>
  );
}

function EmptyState({
  message,
  href,
  linkLabel,
}: {
  message: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-[#8C8785]">{message}</p>
      <Link
        href={href}
        className="rounded-full bg-[#C8102E] px-6 py-3 text-white transition-colors hover:bg-[#a90d26]"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
