"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { AddToCalendar } from "@/components/AddToCalendar";
import { ChainFall } from "@/components/effects/ChainFall";
import { useLocale, useT } from "@/components/LanguageProvider";
import { loadMatches } from "@/app/actions";
import {
  formatEventDate,
  instagramUrl,
  type Match,
  type Matches,
  type OrgEvent,
} from "@/lib/api";
import { calendarEntry } from "@/lib/calendarLinks";
import { labelFor } from "@/lib/i18n";

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
    <div className="relative flex min-h-screen w-full flex-1 justify-center bg-orange-200 px-6 py-16">
      <ChainFall onComplete={() => setRevealed(true)} />

      <motion.div
        className="flex w-full max-w-3xl flex-col items-center gap-10"
        initial={{ opacity: 0, y: 8 }}
        animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-600">
            {t.matches.title}
          </h1>
          <p className="text-slate-500/50">{t.matches.subtitle}</p>
        </div>

        {state.status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <motion.span
              className="h-8 w-8 rounded-full border-2 border-slate-500/20 border-t-slate-500"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
            <p className="text-sm text-slate-500/60">{t.matches.loading}</p>
          </div>
        )}

        {state.status === "error" && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-slate-600">{t.matches.loadError}</p>
            <button
              type="button"
              onClick={retry}
              className="cursor-pointer rounded-full bg-slate-500 px-6 py-3 text-orange-50 transition-colors hover:bg-slate-600"
            >
              {t.common.tryAgain}
            </button>
          </div>
        )}

        {state.status === "ready" && (
          <>
            <div className="flex w-full flex-col gap-4">
              {state.matches.recommendations.map((match, i) => (
                <motion.div
                  key={match.org_id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: EASE }}
                >
                  <OrganizationCard match={match} />
                </motion.div>
              ))}
            </div>

            {state.matches.suggestions.length > 0 && (
              <div className="flex w-full flex-col gap-4">
                <h2 className="text-center text-xl font-semibold text-slate-600">
                  {t.matches.alsoLike}
                </h2>
                {state.matches.suggestions.map((match, i) => (
                  <motion.div
                    key={match.org_id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.1, ease: EASE }}
                  >
                    <OrganizationCard match={match} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/majClass"
            className="rounded-full border border-slate-500/30 px-6 py-3 text-slate-500 transition-colors hover:border-slate-500"
          >
            {t.matches.editAnswers}
          </Link>
          {state.status === "ready" && (
            <Link
              href="/homePage"
              className="rounded-full bg-slate-500 px-6 py-3 text-orange-50 transition-colors hover:bg-slate-600"
            >
              {t.matches.goHome}
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function OrganizationCard({ match }: { match: Match }) {
  const t = useT();
  const { organization, reason, events } = match;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-500/15 bg-orange-50 p-6">
      <div className="flex flex-col gap-1">
        {organization.category && (
          <span className="text-xs uppercase tracking-wide text-slate-500/50">
            {labelFor(t.options.categories, organization.category)}
          </span>
        )}
        <h2 className="text-xl font-semibold text-slate-600">
          {organization.name}
        </h2>
        {organization.instagramUsername && (
          <a
            href={instagramUrl(organization.instagramUsername)}
            target="_blank"
            rel="noreferrer"
            className="flex w-fit items-center gap-1 text-sm text-slate-500/70 transition-colors hover:text-slate-600"
          >
            @{organization.instagramUsername}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <p className="text-slate-500">{reason}</p>

      {(organization.meetingTime || organization.contact) && (
        <div className="flex flex-col gap-1 text-sm text-slate-500/70">
          {organization.meetingTime && <p>{t.matches.meets(organization.meetingTime)}</p>}
          {organization.contact && <p>{t.matches.contact(organization.contact)}</p>}
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-slate-500/10 pt-4">
        <h3 className="text-sm font-medium text-slate-600">{t.matches.upcomingEvents}</h3>
        {events.length === 0 ? (
          <p className="text-sm text-slate-500/50">{t.matches.noEventsPosted}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {events.map((event) => (
              <EventRow key={event.id} event={event} orgName={organization.name} />
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function EventRow({ event, orgName }: { event: OrgEvent; orgName: string }) {
  const locale = useLocale();
  const time = [event.start_time, event.end_time].filter(Boolean).join(" – ");

  const content = (
    <>
      <span className="w-16 shrink-0 rounded-full bg-slate-500/10 py-1 text-center text-xs font-medium text-slate-600">
        {formatEventDate(event.start_date, locale)}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm text-slate-600">{event.title}</span>
        <span className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500/60">
          {time && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {time}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          )}
        </span>
      </span>
    </>
  );

  return (
    <li className="flex items-center gap-2">
      {event.source_url ? (
        <a
          href={event.source_url}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 transition-colors hover:bg-slate-500/5"
        >
          {content}
        </a>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3 p-1">{content}</div>
      )}
      <AddToCalendar entry={calendarEntry(event, orgName)} iconOnly variant="light" />
    </li>
  );
}
