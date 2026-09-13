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

    const tl = gsap.timeline({
      onComplete: () => onComplete?.(),
    });

    tl.to(pieces, {
      duration: 0.75,
      physics2D: {
        velocity: "random(500,1100)",
        angle: "random(240,300)",
        gravity: 1800,
      },
      rotation: "random(-180,180)",
      stagger: { each: 0.01, from: "center" },
    });

    // Settle every piece onto the exact grid coordinate ChainFall starts
    // from on the next page, so the transition reads as one continuous
    // chain of links instead of jumping between two different layouts.
    tl.to(
      pieces,
      {
        duration: 0.4,
        ease: "power2.out",
        left: (i: number) => `${CHAIN_PIECES[i].left}vw`,
        top: (i: number) => `${CHAIN_PIECES[i].top}vh`,
        xPercent: 0,
        yPercent: 0,
        x: 0,
        y: 0,
        rotation: 0,
        stagger: { each: 0.005, from: "center" },
      },
      "-=0.15"
    );

    return () => {
      backdropTween.kill();
      tl.kill();
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
          className="absolute text-white opacity-0"
          style={{ width: p.size, height: p.size }}
        >
          <Link className="h-full w-full" strokeWidth={2} />
        </div>
      ))}
    </div>
  );
}
