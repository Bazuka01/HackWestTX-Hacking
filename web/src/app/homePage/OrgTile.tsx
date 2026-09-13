import { ArrowUpRight } from "lucide-react";
import { formatEventDate, instagramUrl, type Match } from "@/lib/api";
import { OTHER_ORG_COLOR } from "@/lib/matchColors";

// A matched organization: why it fits, plus its next event.
export function OrgTile({
  match,
  color = OTHER_ORG_COLOR,
  featured,
}: {
  match: Match;
  color?: string;
  featured?: boolean;
}) {
  const { organization, reason, events } = match;
  const nextEvent = events[0];

  return (
    <div
      className={`relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] ${
        featured ? "p-6" : "p-4"
      }`}
    >
      <div>
        {organization.category && (
          <div
            className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-[#F2F0EE]"
            style={{ backgroundColor: `${color}33` }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {organization.category}
          </div>
        )}
        <div
          className={`font-semibold text-[#F2F0EE] ${
            featured ? "text-xl" : "text-[15px]"
          }`}
        >
          {organization.name}
        </div>
        <p className={`mt-2 text-[#8C8785] ${featured ? "text-sm" : "text-xs"}`}>
          {reason}
        </p>
        {featured && organization.meetingTime && (
          <p className="mt-2 text-sm text-[#8C8785]">
            Meets {organization.meetingTime}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-[#8C8785]">
        <span>
          {nextEvent
            ? `Next: ${formatEventDate(nextEvent.start_date)} · ${nextEvent.title}`
            : "No upcoming events yet"}
        </span>
        {organization.instagramUsername && (
          <a
            href={instagramUrl(organization.instagramUsername)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-0.5 transition-colors hover:text-[#C8102E]"
          >
            @{organization.instagramUsername}
            <ArrowUpRight className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
