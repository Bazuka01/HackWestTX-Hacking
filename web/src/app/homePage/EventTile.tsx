"use client";

import { Check, Plus } from "lucide-react";
import type { RecommendedEvent } from "@/lib/events";

function formatEventDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function EventTile({
  event,
  featured,
  isSaved,
  onSave,
}: {
  event: RecommendedEvent;
  featured?: boolean;
  isSaved: boolean;
  onSave: () => void;
}) {
  return (
    <div
      className={`relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] ${
        featured ? "p-6" : "p-4"
      }`}
    >
      <button
        type="button"
        onClick={onSave}
        disabled={isSaved}
        aria-label={isSaved ? "Already saved" : "Save event"}
        className={`absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          isSaved
            ? "cursor-default bg-[#2E2E2E] text-[#8C8785]"
            : "cursor-pointer bg-[#C8102E] text-white hover:bg-[#a90d26]"
        }`}
      >
        {isSaved ? (
          <Check className="h-4 w-4" strokeWidth={3} />
        ) : (
          <Plus className="h-4 w-4" strokeWidth={3} />
        )}
      </button>

      <div>
        <div
          className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-[#F2F0EE]"
          style={{ backgroundColor: `${event.orgColor}33` }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: event.orgColor }}
          />
          {event.org}
        </div>
        <div
          className={`pr-8 font-semibold text-[#F2F0EE] ${
            featured ? "text-xl" : "text-[15px]"
          }`}
        >
          {event.title}
        </div>
        {featured && event.blurb && (
          <p className="mt-2 text-sm text-[#8C8785]">{event.blurb}</p>
        )}
      </div>

      <div className="mt-3 text-xs text-[#8C8785]">
        {formatEventDate(event.date)} · {event.time} · {event.location}
      </div>
    </div>
  );
}
