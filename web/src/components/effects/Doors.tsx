"use client";

import { motion } from "motion/react";

const EASE = [0.76, 0, 0.24, 1] as const;

export function Doors({
  variant = "in",
  onComplete,
}: {
  variant?: "in" | "out";
  onComplete?: () => void;
}) {
  const isIn = variant === "in";

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex overflow-hidden">
      <motion.div
        className="h-full w-1/2 bg-[#DC143C]"
        initial={{ x: isIn ? "0%" : "-100%" }}
        animate={{ x: isIn ? "-100%" : "0%" }}
        transition={{ duration: 0.7, ease: EASE }}
      />
      <motion.div
        className="h-full w-1/2 bg-[#DC143C]"
        initial={{ x: isIn ? "0%" : "100%" }}
        animate={{ x: isIn ? "100%" : "0%" }}
        transition={{ duration: 0.7, ease: EASE }}
        onAnimationComplete={onComplete}
      />
    </div>
  );
}
