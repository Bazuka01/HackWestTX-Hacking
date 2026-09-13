"use client";

import { motion } from "motion/react";

const EASE = [0.76, 0, 0.24, 1] as const;

export function Iris({ onComplete }: { onComplete?: () => void }) {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 bg-slate-500"
      initial={{ clipPath: "circle(150% at 50% 50%)" }}
      animate={{ clipPath: "circle(0% at 50% 50%)" }}
      transition={{ duration: 0.8, ease: EASE }}
      onAnimationComplete={onComplete}
    />
  );
}
