"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import gsap from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { X, ChevronDown } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { useSavedEvents } from "@/lib/useSavedEvents";
import { EventDetailsDialog } from "./EventDetailsDialog";
import type { SavedEvent } from "@/lib/savedEventsStore";

gsap.registerPlugin(InertiaPlugin);

function formatEventDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function SavedEventsPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { events, remove } = useSavedEvents();
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SavedEvent | null>(null);

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
  }, [events.length]);

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
  }, [events.length]);

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

        {events.length === 0 ? (
          <p className="text-sm text-[#8C8785]">
            You haven&apos;t saved any events yet. Tap the + on an event from
            your home page to save it here.
          </p>
        ) : (
          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {events.map((event) => (
              <div
                key={event.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedEvent(event)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedEvent(event);
                  }
                }}
                className="event-card group relative flex aspect-square cursor-pointer flex-col justify-between rounded-2xl border border-[#2E2E2E] bg-[#1A1A1A] p-4 text-left transition-colors hover:border-[#C8102E]"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(event.id);
                  }}
                  title="Remove from saved events"
                  className="absolute top-3 right-3 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#2E2E2E] text-[#8C8785] transition-colors hover:bg-[#C8102E] hover:text-white"
                >
                  <X className="h-3 w-3" strokeWidth={3} />
                </button>
                <div>
                  <p className="text-sm font-semibold text-[#F2F0EE]">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-[#8C8785]">
                    {event.org} · {event.location}
                  </p>
                </div>
                <p className="text-xs text-[#8C8785]">
                  {formatEventDate(event.date)} · {event.time}
                </p>
              </div>
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
