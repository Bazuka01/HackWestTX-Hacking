"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ChainFall } from "@/components/effects/ChainFall";
import { Doors } from "@/components/effects/Doors";
import { useT } from "@/components/LanguageProvider";
import { ScrollProgressRail } from "@/components/ScrollProgressRail";
import { loadMatches } from "@/app/actions";
import { OrgTile } from "@/app/homePage/OrgTile";
import type { Matches } from "@/lib/api";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; matches: Matches };

const EASE = [0.76, 0, 0.24, 1] as const;

// Matches are saved to the account, so Gemini only runs the first time (or
// after the answers change). React runs effects twice in development, so
// share one in-flight request between them.
let pendingMatches: Promise<Matches | null> | null = null;

function loadMatchesOnce() {
  pendingMatches ??= loadMatches().finally(() => {
    pendingMatches = null;
  });
  return pendingMatches;
}

export function MatchesView() {
  const router = useRouter();
  const t = useT();
  const [revealed, setRevealed] = useState(false);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [leavingTo, setLeavingTo] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    loadMatchesOnce()
      .then((matches) => {
        if (ignore) return;
        if (matches) {
          setState({ status: "ready", matches });
        } else {
          // No saved answers yet.
          router.replace("/majClass");
        }
      })
      .catch(() => {
        if (!ignore) setState({ status: "error" });
      });

    return () => {
      ignore = true;
    };
  }, [attempt, router]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  return (
    <div className="relative flex min-h-screen w-full flex-1 justify-center overflow-hidden bg-[#1A1A1A] px-6 py-16">
      <AmbientBackground />
      <ScrollProgressRail fixed className="top-1/2 right-6 z-40 -translate-y-1/2" />
      <ChainFall onComplete={() => setRevealed(true)} />
      {leavingTo && (
        <Doors variant="out" onComplete={() => router.push(leavingTo)} />
      )}

      <motion.div
        className="relative flex w-full max-w-3xl flex-col items-center gap-10"
        initial={{ opacity: 0, y: 8 }}
        animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#DC143C]">
            {t.matches.title}
          </h1>
          <p className="text-[#8C8785]">{t.matches.subtitle}</p>
        </div>

        {state.status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <motion.span
              className="h-8 w-8 rounded-full border-2 border-[#F3A5A5]/20 border-t-[#DC143C]"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
            <p className="text-sm text-[#8C8785]">{t.matches.loading}</p>
          </div>
        )}

        {state.status === "error" && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-white">{t.matches.loadError}</p>
            <button
              type="button"
              onClick={retry}
              className="cursor-pointer rounded-full bg-black px-6 py-3 text-[#DC143C] transition-colors hover:bg-black/80"
            >
              {t.common.tryAgain}
            </button>
          </div>
        )}

        {state.status === "ready" && (
          <>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              {state.matches.recommendations.map((match, i) => (
                <motion.div
                  key={match.org_id}
                  className="sm:min-h-[200px]"
                  initial={{ opacity: 0, y: 16 }}
                  animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: EASE }}
                >
                  <OrgTile match={match} featured />
                </motion.div>
              ))}
            </div>

            {state.matches.suggestions.length > 0 && (
              <div className="flex w-full flex-col gap-4">
                <h2 className="font-heading text-center text-xl font-semibold text-white">
                  {t.matches.alsoLike}
                </h2>
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                  {state.matches.suggestions.map((match, i) => (
                    <motion.div
                      key={match.org_id}
                      className="sm:min-h-[174px]"
                      initial={{ opacity: 0, y: 16 }}
                      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                      transition={{ duration: 0.5, delay: 0.5 + i * 0.1, ease: EASE }}
                    >
                      <OrgTile match={match} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setLeavingTo("/majClass")}
            className="cursor-pointer rounded-full bg-black px-6 py-3 text-[#DC143C] transition-colors hover:bg-black/80"
          >
            {t.matches.editAnswers}
          </button>
          {state.status === "ready" && (
            <button
              type="button"
              onClick={() => setLeavingTo("/homePage")}
              className="cursor-pointer rounded-full bg-black px-6 py-3 text-[#DC143C] transition-colors hover:bg-black/80"
            >
              {t.matches.goHome}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
