import type { OrgEvent } from "@/lib/api";

// "Add to calendar": a Google Calendar link and a downloadable .ics file
// (for Apple Calendar, Outlook, and most others). Event times are Lubbock
// wall-clock times, so both use the America/Chicago time zone.

export type CalendarEntry = {
  id: string;
  title: string;
  orgName: string;
  startDate: string; // yyyy-mm-dd
  endDate: string | null;
  startTime: string | null; // e.g. "6:00 PM"
  endTime: string | null;
  location: string | null;
  sourceUrl: string | null;
};

// Convert an event from the API into a calendar entry.
export function calendarEntry(event: OrgEvent, orgName: string): CalendarEntry {
  return {
    id: event.id,
    title: event.title,
    orgName,
    startDate: event.start_date,
    endDate: event.end_date,
    startTime: event.start_time,
    endTime: event.end_time,
    location: event.location,
    sourceUrl: event.source_url,
  };
}

const TIME_ZONE = "America/Chicago";
const DEFAULT_DURATION_MINUTES = 60;

// "6:00 PM" -> minutes after midnight, or null if there's no usable time.
function parseTime(time: string | null) {
  const match = time?.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?$/i);
  if (!match) return null;
  const hours = (Number(match[1]) % 12) + (match[3].toLowerCase() === "p" ? 12 : 0);
  return hours * 60 + Number(match[2] ?? 0);
}

// Date arithmetic on wall-clock fields; UTC here just avoids DST shifts.
function toUtcDate(isoDate: string, minutes = 0) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, minutes));
}

const pad = (n: number) => String(n).padStart(2, "0");

function formatDate(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function formatDateTime(date: Date) {
  return `${formatDate(date)}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00`;
}

// Start and end as calendar strings. Events without a start time are all-day;
// an end time earlier than the start means the event runs past midnight.
function eventRange(entry: CalendarEntry) {
  const startMinutes = parseTime(entry.startTime);
  const lastDate = entry.endDate ?? entry.startDate;

  if (startMinutes === null) {
    const dayAfterLast = toUtcDate(lastDate);
    dayAfterLast.setUTCDate(dayAfterLast.getUTCDate() + 1);
    return {
      allDay: true,
      start: formatDate(toUtcDate(entry.startDate)),
      end: formatDate(dayAfterLast), // exclusive
    };
  }

  const start = toUtcDate(entry.startDate, startMinutes);
  const endMinutes = parseTime(entry.endTime);
  let end =
    endMinutes === null
      ? new Date(start.getTime() + DEFAULT_DURATION_MINUTES * 60_000)
      : toUtcDate(lastDate, endMinutes);
  if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60_000);

  return { allDay: false, start: formatDateTime(start), end: formatDateTime(end) };
}

function description(entry: CalendarEntry) {
  return [entry.orgName, entry.sourceUrl].filter(Boolean).join("\n");
}

export function googleCalendarUrl(entry: CalendarEntry) {
  const { start, end } = eventRange(entry);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: entry.title,
    dates: `${start}/${end}`,
    ctz: TIME_ZONE,
    details: description(entry),
    location: entry.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// Text values in .ics files escape backslashes, commas, semicolons and newlines.
function escapeText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

// Lines longer than 75 characters are folded onto indented continuation lines.
function foldLine(line: string) {
  const parts = [];
  for (let i = 0; i < line.length; i += 73) parts.push(line.slice(i, i + 73));
  return parts.join("\r\n ");
}

export function icsFile(entry: CalendarEntry) {
  const { allDay, start, end } = eventRange(entry);
  const when = allDay
    ? [`DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`]
    : [`DTSTART;TZID=${TIME_ZONE}:${start}`, `DTEND;TZID=${TIME_ZONE}:${end}`];
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ConnectX//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    // Central Time rules, so calendars that need the zone spelled out get it.
    "BEGIN:VTIMEZONE",
    `TZID:${TIME_ZONE}`,
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:-0600",
    "TZOFFSETTO:-0500",
    "TZNAME:CDT",
    "DTSTART:19700308T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0600",
    "TZNAME:CST",
    "DTSTART:19701101T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${entry.id}@connectx`,
    `DTSTAMP:${stamp}`,
    ...when,
    `SUMMARY:${escapeText(entry.title)}`,
    ...(entry.location ? [`LOCATION:${escapeText(entry.location)}`] : []),
    `DESCRIPTION:${escapeText(description(entry))}`,
    ...(entry.sourceUrl ? [`URL:${entry.sourceUrl}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function downloadIcs(entry: CalendarEntry) {
  const blob = new Blob([icsFile(entry)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${entry.title.replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "") || "event"}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
