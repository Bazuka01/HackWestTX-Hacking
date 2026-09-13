"use client";

import { motion } from "motion/react";

const EASE = [0.76, 0, 0.24, 1] as const;

export function Iris({
  variant = "in",
  onComplete,
}: {
  variant?: "in" | "out";
  onComplete?: () => void;
}) {
  const covered = "circle(150% at 50% 50%)";
  const open = "circle(0% at 50% 50%)";

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 bg-[#DC143C]"
      initial={{ clipPath: variant === "in" ? covered : open }}
      animate={{ clipPath: variant === "in" ? open : covered }}
      transition={{ duration: 0.8, ease: EASE }}
      onAnimationComplete={onComplete}
    />
  );
}
