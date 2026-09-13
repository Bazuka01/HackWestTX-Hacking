"use client";

import { useState } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import {
  EventDetailsDialog,
  type EventDetails,
} from "@/components/EventDetailsDialog";
import { useLocale, useT } from "@/components/LanguageProvider";

// An event plus its organization's color.
export type CalendarEvent = EventDetails & { color: string };

export type CalendarOrg = { id: string; name: string; color: string };

type Cell = { day: number; inMonth: boolean; dateKey: string };
type View = "month" | "week";

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Short weekday names in the student's language, Sunday first.
function weekdayNames(locale: string) {
  // January 4, 1970 was a Sunday.
  return Array.from({ length: 7 }, (_, i) =>
    new Date(Date.UTC(1970, 0, 4 + i)).toLocaleDateString(locale, {
      weekday: "short",
      timeZone: "UTC",
    })
  );
}

function buildMonthGrid(year: number, month: number): Cell[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: Cell[] = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push({
      day: daysInPrevMonth - startWeekday + 1 + i,
      inMonth: false,
      dateKey: "",
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, inMonth: true, dateKey: toDateKey(year, month, day) });
  }

  let trailingDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: trailingDay, inMonth: false, dateKey: "" });
    trailingDay++;
  }

  return cells;
}

function buildWeekCells(now: Date, weekdays: string[]) {
  const sunday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay()
  );

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i);
    return {
      day: d.getDate(),
      weekday: weekdays[d.getDay()],
      dateKey: toDateKey(d.getFullYear(), d.getMonth(), d.getDate()),
    };
  });
}

// This month's (or week's) events from the student's matched organizations
// and saved events, colored by organization.
export function CalendarView({
  events,
  orgs,
}: {
  events: CalendarEvent[];
  orgs: CalendarOrg[];
}) {
  const t = useT();
  const locale = useLocale();
  const [view, setView] = useState<View>("month");
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Local date parts, not toISOString(), which is UTC and would mark
  // tomorrow as today during the evening in Texas.
  const todayKey = toDateKey(year, month, now.getDate());
  const weekdays = weekdayNames(locale);

  const monthCells = buildMonthGrid(year, month);
  const weekCells = buildWeekCells(now, weekdays);

  const monthLabel = now.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
  const weekLabel = (() => {
    const first = weekCells[0];
    const last = weekCells[weekCells.length - 1];
    const fmt = (dateKey: string) => {
      const [y, m, d] = dateKey.split("-").map(Number);
      return new Date(y, m - 1, d).toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      });
    };
    return `${fmt(first.dateKey)} – ${fmt(last.dateKey)}, ${year}`;
  })();

  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const list = eventsByDate.get(event.startDate) ?? [];
    list.push(event);
    eventsByDate.set(event.startDate, list);
  }

  function openEvent(event: CalendarEvent) {
    setSelectedEvent({ ...event, orgColor: event.color });
  }

  return (
    <div className="min-h-screen w-full bg-[#1A1A1A]">
      <DashboardNav active="calendar" />

      <div className="mx-auto max-w-7xl px-6 pt-28 pb-16">
        <div className="grid grid-cols-3 items-center">
          <div className="flex items-center gap-4 text-lg font-semibold">
            <button
              type="button"
              onClick={() => setView("month")}
              className={`cursor-pointer transition-colors ${
                view === "month" ? "text-[#DC143C]" : "text-[#8C8785] hover:text-[#DC143C]"
              }`}
            >
              {t.calendar.monthly}
            </button>
            <button
              type="button"
              onClick={() => setView("week")}
              className={`cursor-pointer transition-colors ${
                view === "week" ? "text-[#DC143C]" : "text-[#8C8785] hover:text-[#DC143C]"
              }`}
            >
              {t.calendar.weekly}
            </button>
          </div>

          <h1 className="font-heading text-center text-3xl font-bold tracking-tight text-[#DC143C] first-letter:uppercase">
            {view === "month" ? monthLabel : weekLabel}
          </h1>

          <div className="flex flex-wrap justify-end gap-3">
            {orgs.map((org) => (
              <div
                key={org.id}
                className="flex items-center gap-1.5 text-xs font-medium text-white"
              >
                <span className="h-2 w-2" style={{ backgroundColor: org.color }} />
                {org.name}
              </div>
            ))}
          </div>
        </div>

        {view === "month" ? (
          <div className="mt-6 overflow-hidden rounded-lg border border-[#2E2E2E]">
            <div className="grid grid-cols-7 border-b border-[#2E2E2E] bg-[#242424]">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-xs font-semibold text-[#8C8785]"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 [&>*:nth-child(7n)]:border-r-0">
              {monthCells.map((cell, i) => (
                <DayCell
                  key={i}
                  label={cell.day}
                  dayEvents={cell.inMonth ? (eventsByDate.get(cell.dateKey) ?? []) : []}
                  isToday={cell.inMonth && cell.dateKey === todayKey}
                  faded={!cell.inMonth}
                  minHeight={130}
                  maxEvents={2}
                  eventTextClass="text-[11px]"
                  onSelectEvent={openEvent}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-lg border border-[#2E2E2E]">
            <div className="grid grid-cols-7 border-b border-[#2E2E2E] bg-[#242424]">
              {weekCells.map((cell) => (
                <div
                  key={cell.dateKey}
                  className="p-2 text-center text-xs font-semibold text-[#8C8785]"
                >
                  {cell.weekday}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 [&>*:nth-child(7n)]:border-r-0">
              {weekCells.map((cell) => (
                <DayCell
                  key={cell.dateKey}
                  label={cell.day}
                  dayEvents={eventsByDate.get(cell.dateKey) ?? []}
                  isToday={cell.dateKey === todayKey}
                  faded={false}
                  minHeight={240}
                  maxEvents={5}
                  eventTextClass="text-sm"
                  onSelectEvent={openEvent}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <EventDetailsDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}

function DayCell({
  label,
  dayEvents,
  isToday,
  faded,
  minHeight,
  maxEvents,
  eventTextClass,
  onSelectEvent,
}: {
  label: number;
  dayEvents: CalendarEvent[];
  isToday: boolean;
  faded: boolean;
  minHeight: number;
  maxEvents: number;
  eventTextClass: string;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const t = useT();

  return (
    <div
      style={{ minHeight }}
      className={`flex flex-col gap-1 border-r border-b border-[#2E2E2E] p-2 ${
        faded ? "opacity-30" : ""
      } ${isToday ? "bg-white/10" : ""}`}
    >
      <div className="mb-1 text-sm whitespace-nowrap text-[#8C8785]">{label}</div>
      <div className="flex flex-col gap-1">
        {dayEvents.slice(0, maxEvents).map((event) => (
          <button
            key={event.id}
            type="button"
            title={event.title}
            onClick={() => onSelectEvent(event)}
            className={`flex cursor-pointer items-center gap-1.5 text-left font-medium text-white transition-colors hover:text-[#DC143C] ${eventTextClass}`}
          >
            <span
              className="h-1.5 w-1.5 shrink-0"
              style={{ backgroundColor: event.color }}
            />
            <span className="font-heading truncate underline decoration-[#DC143C] underline-offset-2">
              {event.title}
            </span>
          </button>
        ))}
        {dayEvents.length > maxEvents && (
          <div className="text-[10px] text-[#8C8785]">
            {t.calendar.more(dayEvents.length - maxEvents)}
          </div>
        )}
      </div>
    </div>
  );
}
