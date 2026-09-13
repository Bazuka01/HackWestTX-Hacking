"use client";

import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue } from "motion/react";

// Top-left -> middle -> a loop -> down to bottom-left, adapted from
// https://motion.dev/examples/react-motion-path
const PATH_D =
  "M5,4 C22,16 36,34 50,50 C68,38 82,55 66,70 C54,80 40,64 50,50 C38,62 20,80 8,96";
const DURATION = 16000; // ms per lap

export function MotionPathTrail() {
  const pathRef = useRef<SVGPathElement>(null);
  const left = useMotionValue("5%");
  const top = useMotionValue("4%");

  useAnimationFrame((t) => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    const progress = (t % DURATION) / DURATION;
    const point = path.getPointAtLength(progress * length);
    left.set(`${point.x}%`);
    top.set(`${point.y}%`);
  });

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          d={PATH_D}
          fill="none"
          stroke="#DC143C"
          strokeOpacity={0.12}
          strokeWidth={0.6}
        />
      </svg>
      <motion.div
        style={{ left, top }}
        className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DC143C] shadow-[0_0_10px_2px_rgba(220,20,60,0.5)]"
      />
    </div>
  );
}
