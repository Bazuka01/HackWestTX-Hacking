"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { ChainFall } from "@/components/effects/ChainFall";
import {
  formatEventDate,
  instagramUrl,
  type OrgEvent,
  type Recommendation,
} from "@/lib/api";
import { getRecommendations, loadProfile } from "@/lib/studentSession";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; recommendations: Recommendation[] };

const EASE = [0.76, 0, 0.24, 1] as const;

export default function RecommendationsPage() {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const profile = loadProfile();
    if (!profile) {
      router.replace("/majClass");
      return;
    }

    let ignore = false;
    getRecommendations(profile)
      .then((recommendations) => {
        if (!ignore) setState({ status: "ready", recommendations });
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [attempt, router]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  const hasEvents =
    state.status === "ready" &&
    state.recommendations.some((rec) => rec.events.length > 0);

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
            Your Matches
          </h1>
          <p className="text-slate-500/50">
            Organizations picked for your major and interests.
          </p>
        </div>

        {state.status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <motion.span
              className="h-8 w-8 rounded-full border-2 border-slate-500/20 border-t-slate-500"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
            <p className="text-sm text-slate-500/60">
              Finding your organizations. This can take a few seconds.
            </p>
          </div>
        )}

        {state.status === "error" && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-slate-600">
              We couldn&apos;t load your matches.
            </p>
            <p className="text-xs text-slate-500/50">{state.message}</p>
            <button
              type="button"
              onClick={retry}
              className="cursor-pointer rounded-full bg-slate-500 px-6 py-3 text-orange-50 transition-colors hover:bg-slate-600"
            >
              Try again
            </button>
          </div>
        )}

        {state.status === "ready" && (
          <div className="flex w-full flex-col gap-4">
            {state.recommendations.map((rec, i) => (
              <motion.div
                key={rec.org_id}
                initial={{ opacity: 0, y: 16 }}
                animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: EASE }}
              >
                <OrganizationCard recommendation={rec} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/majClass"
            className="rounded-full border border-slate-500/30 px-6 py-3 text-slate-500 transition-colors hover:border-slate-500"
          >
            Start over
          </Link>
          {hasEvents && (
            <Link
              href="/savedEvents"
              className="rounded-full bg-slate-500 px-6 py-3 text-orange-50 transition-colors hover:bg-slate-600"
            >
              See all events
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function OrganizationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const { organization, reason, events } = recommendation;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-500/15 bg-orange-50 p-6">
      <div className="flex flex-col gap-1">
        {organization.category && (
          <span className="text-xs uppercase tracking-wide text-slate-500/50">
            {organization.category}
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
          {organization.meetingTime && <p>Meets: {organization.meetingTime}</p>}
          {organization.contact && <p>Contact: {organization.contact}</p>}
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-slate-500/10 pt-4">
        <h3 className="text-sm font-medium text-slate-600">Upcoming events</h3>
        {events.length === 0 ? (
          <p className="text-sm text-slate-500/50">
            No events posted yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function EventRow({ event }: { event: OrgEvent }) {
  const time = [event.start_time, event.end_time].filter(Boolean).join(" – ");

  const content = (
    <>
      <span className="w-14 shrink-0 rounded-full bg-slate-500/10 py-1 text-center text-xs font-medium text-slate-600">
        {formatEventDate(event.start_date)}
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
    <li>
      {event.source_url ? (
        <a
          href={event.source_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl p-1 transition-colors hover:bg-slate-500/5"
        >
          {content}
        </a>
      ) : (
        <div className="flex items-center gap-3 p-1">{content}</div>
      )}
    </li>
  );
}
