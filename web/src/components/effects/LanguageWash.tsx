"use client";

import { useEffect } from "react";
import { motion } from "motion/react";

const COLS = 14;
const ROWS = 9;
const BASE_DURATION = 1.0;
const MAX_DELAY = 0.35;
const MIDPOINT_MS = 700;
const COMPLETE_MS = 1400;

export type LanguageParticle = {
  char: string;
  x: number;
  y: number;
  size: number;
  rotate: number;
  delay: number;
};

export function createLanguageParticles(
  charset: string,
  origin: { x: number; y: number }
): LanguageParticle[] {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cellW = w / COLS;
  const cellH = h / ROWS;
  const maxDist = Math.hypot(w, h);

  const particles: LanguageParticle[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = cellW * (col + 0.5) + (Math.random() - 0.5) * cellW * 0.3;
      const y = cellH * (row + 0.5) + (Math.random() - 0.5) * cellH * 0.3;
      const dist = Math.hypot(x - origin.x, y - origin.y);
      particles.push({
        char: charset[Math.floor(Math.random() * charset.length)],
        x,
        y,
        size: Math.min(cellW, cellH) * 0.75,
        rotate: (Math.random() - 0.5) * 20,
        delay: (dist / maxDist) * MAX_DELAY,
      });
    }
  }
  return particles;
}

export function LanguageWash({
  particles,
  origin,
  onMidpoint,
  onComplete,
}: {
  particles: LanguageParticle[];
  origin: { x: number; y: number };
  onMidpoint: () => void;
  onComplete: () => void;
}) {
  useEffect(() => {
    const midTimer = setTimeout(onMidpoint, MIDPOINT_MS);
    const doneTimer = setTimeout(onComplete, COMPLETE_MS);
    return () => {
      clearTimeout(midTimer);
      clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="fixed font-semibold text-slate-500 select-none"
          style={{ fontSize: p.size }}
          initial={{ left: origin.x, top: origin.y, opacity: 0, scale: 0.3, rotate: p.rotate }}
          animate={{
            left: p.x,
            top: p.y,
            opacity: [0, 1, 1, 0],
            scale: 1,
          }}
          transition={{
            duration: BASE_DURATION,
            delay: p.delay,
            times: [0, 0.25, 0.8, 1],
            ease: "easeOut",
          }}
        >
          {p.char}
        </motion.span>
      ))}
    </div>
  );
}
