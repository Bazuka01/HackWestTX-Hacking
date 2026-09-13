"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { Link } from "lucide-react";
import { CHAIN_PIECES } from "@/components/effects/chainPieces";

gsap.registerPlugin(Physics2DPlugin);

export function ChainCover({ onComplete }: { onComplete?: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const pieces = pieceRefs.current.filter((el): el is HTMLDivElement => el !== null);
    const backdrop = backdropRef.current;

    gsap.set(backdrop, { opacity: 0 });
    gsap.set(pieces, {
      opacity: 1,
      left: "50vw",
      top: "60vh",
      xPercent: -50,
      yPercent: -50,
    });

    const backdropTween = gsap.to(backdrop, {
      opacity: 1,
      duration: 0.3,
      ease: "power1.out",
    });

    const burstTween = gsap.to(pieces, {
      duration: 1.3,
      physics2D: {
        velocity: "random(500,1100)",
        angle: "random(240,300)",
        gravity: 1800,
      },
      rotation: "random(-180,180)",
      stagger: { each: 0.01, from: "center" },
      onComplete: () => onComplete?.(),
    });

    return () => {
      backdropTween.kill();
      burstTween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div ref={backdropRef} className="absolute inset-0 bg-slate-500" />
      {CHAIN_PIECES.map((p, i) => (
        <div
          key={i}
          ref={(el) => {
            pieceRefs.current[i] = el;
          }}
          className="absolute text-orange-50 opacity-0"
          style={{ width: p.size, height: p.size }}
        >
          <Link className="h-full w-full" strokeWidth={2} />
        </div>
      ))}
    </div>
  );
}
