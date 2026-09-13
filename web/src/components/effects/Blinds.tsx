"use client";

import { motion } from "motion/react";

const SLAT_COUNT = 10;
const EASE = [0.76, 0, 0.24, 1] as const;

export function Blinds({ onComplete }: { onComplete?: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col overflow-hidden">
      {Array.from({ length: SLAT_COUNT }).map((_, i) => (
        <motion.div
          key={i}
          className="w-full flex-1 bg-[#DC143C]"
          style={{ transformOrigin: "top" }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.55, delay: i * 0.045, ease: EASE }}
          onAnimationComplete={i === SLAT_COUNT - 1 ? onComplete : undefined}
        />
      ))}
    </div>
  );
}
