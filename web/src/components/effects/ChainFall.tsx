"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { Link } from "lucide-react";
import { CHAIN_PIECES } from "@/components/effects/chainPieces";

gsap.registerPlugin(Physics2DPlugin);

const HOLD_MS = 250;

export function ChainFall({ onComplete }: { onComplete?: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const pieces = pieceRefs.current.filter((el): el is HTMLDivElement => el !== null);
    const backdrop = backdropRef.current;

    gsap.set(backdrop, { opacity: 1 });
    gsap.set(pieces, { opacity: 1 });

    let backdropTween: gsap.core.Tween | undefined;
    let fallTween: gsap.core.Tween | undefined;

    const timer = setTimeout(() => {
      backdropTween = gsap.to(backdrop, {
        opacity: 0,
        duration: 0.5,
        ease: "power1.inOut",
      });

      fallTween = gsap.to(pieces, {
        duration: 1.1,
        physics2D: {
          velocity: "random(300,700)",
          angle: "random(60,120)",
          gravity: 2200,
        },
        rotation: "random(-180,180)",
        stagger: { each: 0.008, from: "random" },
        onComplete: () => onComplete?.(),
      });
    }, HOLD_MS);

    return () => {
      clearTimeout(timer);
      backdropTween?.kill();
      fallTween?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div ref={backdropRef} className="absolute inset-0 bg-[#DC143C]" />
      {CHAIN_PIECES.map((p, i) => (
        <div
          key={i}
          ref={(el) => {
            pieceRefs.current[i] = el;
          }}
          className="absolute text-white"
          style={{ left: `${p.left}vw`, top: `${p.top}vh`, width: p.size, height: p.size }}
        >
          <Link className="h-full w-full" strokeWidth={2} />
        </div>
      ))}
    </div>
  );
}
