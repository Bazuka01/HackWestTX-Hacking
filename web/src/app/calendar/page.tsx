"use client";

import { useState } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import {
  EventDetailsDialog,
  type EventDetails,
} from "@/components/EventDetailsDialog";
import { RECOMMENDED_EVENTS, MATCHED_ORGS, type RecommendedEvent } from "@/lib/events";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type MonthCell = { day: number; inMonth: boolean; dateKey: string };
type View = "month" | "week";

function buildMonthGrid(year: number, month: number): MonthCell[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: MonthCell[] = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push({
      day: daysInPrevMonth - startWeekday + 1 + i,
      inMonth: false,
      dateKey: "",
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, inMonth: true, dateKey });
  }

  let trailingDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: trailingDay, inMonth: false, dateKey: "" });
    trailingDay++;
  }

  return cells;
}

function buildWeekCells(now: Date) {
  const diffToMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { day: d.getDate(), weekday: WEEKDAYS[d.getDay()], dateKey };
  });
}

export default function CalendarPage() {
  const [view, setView] = useState<View>("month");
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);

  const monthCells = buildMonthGrid(now.getFullYear(), now.getMonth());
  const weekCells = buildWeekCells(now);

  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weekLabel = (() => {
    const first = weekCells[0];
    const last = weekCells[weekCells.length - 1];
    const fmt = (dateKey: string) => {
      const [y, m, d] = dateKey.split("-").map(Number);
      return new Date(y, m - 1, d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };
    return `${fmt(first.dateKey)} – ${fmt(last.dateKey)}, ${now.getFullYear()}`;
  })();

  const eventsByDate = new Map<string, RecommendedEvent[]>();
  for (const event of RECOMMENDED_EVENTS) {
    const list = eventsByDate.get(event.date) ?? [];
    list.push(event);
    eventsByDate.set(event.date, list);
  }

  function openEvent(event: RecommendedEvent) {
    setSelectedEvent({
      title: event.title,
      orgName: event.org,
      orgColor: event.orgColor,
      startDate: event.date,
      time: event.time,
      location: event.location,
    });
  }

  return (
    <div className="min-h-screen w-full bg-[#0D0D0D]" style={{ fontFamily: "var(--font-raleway)" }}>
      <DashboardNav active="calendar" />

      <div className="mx-auto max-w-7xl px-6 pt-28 pb-16">
        <div className="grid grid-cols-3 items-center">
          <div className="flex items-center gap-4 text-lg font-semibold">
            <button
              type="button"
              onClick={() => setView("month")}
              className={`cursor-pointer transition-colors ${
                view === "month" ? "text-[#C8102E]" : "text-[#8C8785] hover:text-[#C8102E]"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setView("week")}
              className={`cursor-pointer transition-colors ${
                view === "week" ? "text-[#C8102E]" : "text-[#8C8785] hover:text-[#C8102E]"
              }`}
            >
              Weekly
            </button>
          </div>

          <h1 className="text-center text-2xl font-bold tracking-tight text-[#F2F0EE]">
            {view === "month" ? monthLabel : weekLabel}
          </h1>

          <div className="flex flex-wrap justify-end gap-3">
            {MATCHED_ORGS.map((org) => (
              <div
                key={org.id}
                className="flex items-center gap-1.5 text-sm font-medium text-[#F2F0EE]"
              >
                <span className="h-2.5 w-2.5" style={{ backgroundColor: org.color }} />
                {org.name}
              </div>
            ))}
          </div>
        </div>

        {view === "month" ? (
          <div className="mt-6 overflow-hidden rounded-lg border border-[#2E2E2E]">
            <div className="grid grid-cols-7 border-b border-[#2E2E2E] bg-[#1A1A1A]">
              {WEEKDAYS.map((day) => (
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
            <div className="grid grid-cols-5 border-b border-[#2E2E2E] bg-[#1A1A1A]">
              {weekCells.map((cell) => (
                <div
                  key={cell.dateKey}
                  className="p-2 text-center text-xs font-semibold text-[#8C8785]"
                >
                  {cell.weekday}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 [&>*:nth-child(5n)]:border-r-0">
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
  dayEvents: RecommendedEvent[];
  isToday: boolean;
  faded: boolean;
  minHeight: number;
  maxEvents: number;
  eventTextClass: string;
  onSelectEvent: (event: RecommendedEvent) => void;
}) {
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
            className={`flex cursor-pointer items-center gap-1.5 text-left font-medium text-[#F2F0EE] transition-colors hover:text-[#C8102E] ${eventTextClass}`}
          >
            <span
              className="h-1.5 w-1.5 shrink-0"
              style={{ backgroundColor: event.orgColor }}
            />
            <span className="truncate">{event.title}</span>
          </button>
        ))}
        {dayEvents.length > maxEvents && (
          <div className="text-[10px] text-[#8C8785]">
            +{dayEvents.length - maxEvents} more
          </div>
        )}
      </div>
    </div>
  );
}
