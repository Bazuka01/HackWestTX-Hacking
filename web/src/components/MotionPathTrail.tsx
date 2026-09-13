"use client";

import { useEffect, useMemo } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

type Point = { x: number; y: number };
type Segment = [Point, Point, Point, Point];

// Top-left -> middle -> a loop -> down to bottom-left, adapted from
// https://motion.dev/examples/react-motion-path
const PATH_D =
  "M5,4 C22,16 36,34 50,50 C68,38 82,55 66,70 C54,80 40,64 50,50 C38,62 20,80 8,96";

const SEGMENTS: Segment[] = [
  [{ x: 5, y: 4 }, { x: 22, y: 16 }, { x: 36, y: 34 }, { x: 50, y: 50 }],
  [{ x: 50, y: 50 }, { x: 68, y: 38 }, { x: 82, y: 55 }, { x: 66, y: 70 }],
  [{ x: 66, y: 70 }, { x: 54, y: 80 }, { x: 40, y: 64 }, { x: 50, y: 50 }],
  [{ x: 50, y: 50 }, { x: 38, y: 62 }, { x: 20, y: 80 }, { x: 8, y: 96 }],
];

const STEPS_PER_SEGMENT = 20;
const DURATION = 16; // seconds per lap

function cubicPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}

// Precompute {time -> x/y} keyframes along the whole path once, so the loop
// is driven entirely by Motion's own animate()/repeat, not a hand-rolled
// rAF loop that can silently stall.
function useSampledPath() {
  return useMemo(() => {
    const totalSteps = SEGMENTS.length * STEPS_PER_SEGMENT;
    const times: number[] = [];
    const xs: number[] = [];
    const ys: number[] = [];

    for (let i = 0; i <= totalSteps; i++) {
      const segmentIndex = Math.min(Math.floor(i / STEPS_PER_SEGMENT), SEGMENTS.length - 1);
      const localT = i / STEPS_PER_SEGMENT - segmentIndex;
      const [p0, p1, p2, p3] = SEGMENTS[segmentIndex];
      const point = cubicPoint(p0, p1, p2, p3, Math.min(localT, 1));
      times.push(i / totalSteps);
      xs.push(point.x);
      ys.push(point.y);
    }

    return { times, xs, ys };
  }, []);
}

export function MotionPathTrail() {
  const progress = useMotionValue(0);
  const { times, xs, ys } = useSampledPath();

  const x = useTransform(progress, times, xs);
  const y = useTransform(progress, times, ys);
  const left = useTransform(x, (v) => `${v}%`);
  const top = useTransform(y, (v) => `${v}%`);

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: DURATION,
      repeat: Infinity,
      ease: "linear",
    });
    return () => controls.stop();
  }, [progress]);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d={PATH_D} fill="none" stroke="#DC143C" strokeOpacity={0.12} strokeWidth={0.6} />
      </svg>
      <motion.div
        style={{ left, top }}
        className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DC143C] shadow-[0_0_10px_2px_rgba(220,20,60,0.5)]"
      />
    </div>
  );
}
