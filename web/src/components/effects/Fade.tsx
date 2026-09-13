"use client";

import { motion } from "motion/react";

export function Fade({ onComplete }: { onComplete?: () => void }) {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 bg-slate-500"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
    />
  );
}
