"use client";

import { motion, useScroll, useTransform } from "motion/react";

const THUMB_HEIGHT = 35; // percent of the track

// A small vertical scrollbar-style rail: a thumb sized to the viewport's
// share of the page that slides down the track as you scroll, like a
// normal scrollbar — not a bar that fills up.
export function ScrollProgressRail({
  className = "",
  fixed = false,
}: {
  className?: string;
  fixed?: boolean;
}) {
  const { scrollYProgress } = useScroll();
  const top = useTransform(scrollYProgress, [0, 1], ["0%", `${100 - THUMB_HEIGHT}%`]);

  return (
    <div
      className={`pointer-events-none ${
        fixed ? "fixed" : "relative"
      } h-40 w-2 overflow-hidden rounded-full bg-[#F3A5A5]/15 ${className}`}
    >
      <motion.div
        style={{ top, height: `${THUMB_HEIGHT}%` }}
        className="absolute w-full rounded-full bg-[#DC143C]"
      />
    </div>
  );
}
