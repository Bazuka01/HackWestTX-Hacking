"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import gsap from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ChevronDown } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { formatEventDate } from "@/lib/api";
import { useSavedRecommendations } from "@/lib/studentSession";
import { EventDetailsDialog, type EventDetails } from "./EventDetailsDialog";

gsap.registerPlugin(InertiaPlugin);

type EventItem = {
  id: string;
  title: string;
  orgName: string;
  startDate: string;
  date: string;
  time: string | null;
  location: string;
};

export default function SavedEventsPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const recommendations = useSavedRecommendations();

  // Every event from the student's recommended organizations, soonest first.
  const events = useMemo<EventItem[]>(
    () =>
      (recommendations ?? [])
        .flatMap((rec) =>
          rec.events.map((event) => ({
            id: event.id,
            title: event.title,
            orgName: rec.organization.name,
            startDate: event.start_date,
            date: formatEventDate(event.start_date),
            time: event.start_time,
            location: event.location ?? "Location TBA",
          }))
        )
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [recommendations]
  );

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
          Saved Events
        </h1>

        {recommendations === null && (
          <EmptyState
            message="Answer a few questions to get matched with organizations and their events."
            href="/majClass"
            linkLabel="Get started"
          />
        )}

        {recommendations && events.length === 0 && (
          <EmptyState
            message="Your matched organizations haven't posted any events yet."
            href="/recommendations"
            linkLabel="Back to your matches"
          />
        )}

        {events.length > 0 && (
          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {events.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() =>
                  setSelectedEvent({
                    title: event.title,
                    orgName: event.orgName,
                    startDate: event.startDate,
                    time: event.time,
                    location: event.location,
                  })
                }
                className="event-card relative flex aspect-square cursor-pointer flex-col justify-between rounded-2xl border border-[#2E2E2E] bg-[#1A1A1A] p-4 text-left transition-colors hover:border-[#C8102E]"
              >
                <div>
                  <p className="text-sm font-semibold text-[#F2F0EE]">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-[#8C8785]">
                    {event.orgName}
                  </p>
                  <p className="mt-1 text-xs text-[#8C8785]">
                    {event.location}
                  </p>
                </div>
                <p className="text-xs text-[#8C8785]">
                  {event.time ? `${event.date} · ${event.time}` : event.date}
                </p>
              </button>
            ))}
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
