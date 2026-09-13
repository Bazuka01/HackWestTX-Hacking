"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import gsap from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Check, ChevronDown } from "lucide-react";

gsap.registerPlugin(InertiaPlugin);

type EventItem = {
  id: string;
  title: string;
  date: string;
  location: string;
};

const EVENTS: EventItem[] = [
  { id: "1", title: "Career Fair", date: "Sep 18", location: "Student Union" },
  { id: "2", title: "Hackathon Kickoff", date: "Sep 20", location: "Engineering Hall" },
  { id: "3", title: "Club Rush", date: "Sep 22", location: "Main Quad" },
  { id: "4", title: "Networking Night", date: "Sep 24", location: "Business Building" },
  { id: "5", title: "Study Jam", date: "Sep 26", location: "Library" },
  { id: "6", title: "Alumni Panel", date: "Sep 29", location: "Auditorium" },
  { id: "7", title: "Startup Pitch", date: "Oct 2", location: "Innovation Lab" },
  { id: "8", title: "Resume Workshop", date: "Oct 4", location: "Career Center" },
  { id: "9", title: "Intramural Kickoff", date: "Oct 6", location: "Rec Fields" },
  { id: "10", title: "Coding Bootcamp", date: "Oct 9", location: "CS Building" },
  { id: "11", title: "Art Showcase", date: "Oct 11", location: "Fine Arts Gallery" },
  { id: "12", title: "Trivia Night", date: "Oct 13", location: "Student Center" },
  { id: "13", title: "Volunteer Day", date: "Oct 16", location: "Community Hall" },
  { id: "14", title: "Music Festival", date: "Oct 19", location: "Amphitheater" },
];

export default function SavedEventsPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
  }, []);

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
  }, []);

  function scrollMore() {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
  }

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen w-full bg-orange-200 px-6 py-16"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-600">
          Saved Events
        </h1>

        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {EVENTS.map((event) => {
            const isSelected = selected.has(event.id);
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => toggleSelected(event.id)}
                className={`event-card relative flex aspect-square cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left transition-colors ${
                  isSelected
                    ? "border-slate-500 bg-slate-500/10"
                    : "border-slate-500/15 bg-orange-50 hover:border-slate-500/40"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-slate-500 text-orange-50">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500/70">
                    {event.location}
                  </p>
                </div>
                <p className="text-xs text-slate-500">{event.date}</p>
              </button>
            );
          })}
        </div>
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
            className="fixed bottom-6 left-1/2 z-30 flex h-10 w-10 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full bg-slate-500 text-orange-50 shadow-lg"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
