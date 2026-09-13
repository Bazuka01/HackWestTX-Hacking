"use client";

import { DashboardNav } from "@/components/DashboardNav";
import { RECOMMENDED_EVENTS, MATCHED_ORGS } from "@/lib/events";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Cell = { day: number; inMonth: boolean; dateKey: string };

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

export default function CalendarPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayKey = now.toISOString().slice(0, 10);
  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const cells = buildMonthGrid(year, month);
  const orgById = new Map(MATCHED_ORGS.map((org) => [org.id, org]));

  const eventsByDate = new Map<string, typeof RECOMMENDED_EVENTS>();
  for (const event of RECOMMENDED_EVENTS) {
    const list = eventsByDate.get(event.date) ?? [];
    list.push(event);
    eventsByDate.set(event.date, list);
  }

  return (
    <div className="min-h-screen w-full bg-[#0D0D0D]">
      <DashboardNav active="calendar" />

      <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-[#F2F0EE]">
            {monthLabel}
          </h1>
          <div className="flex flex-wrap gap-2">
            {MATCHED_ORGS.map((org) => (
              <div
                key={org.id}
                className="flex items-center gap-1.5 rounded-full border border-[#2E2E2E] bg-[#1A1A1A] px-3 py-1 text-xs font-medium text-[#F2F0EE]"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: org.color }}
                />
                {org.name}
              </div>
            ))}
          </div>
        </div>

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

          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const dayEvents = cell.inMonth
                ? (eventsByDate.get(cell.dateKey) ?? [])
                : [];
              const isToday = cell.inMonth && cell.dateKey === todayKey;

              return (
                <div
                  key={i}
                  className={`min-h-[96px] border-r border-b border-[#2E2E2E] p-1.5 [&:nth-child(7n)]:border-r-0 ${
                    cell.inMonth ? "" : "opacity-30"
                  }`}
                >
                  <div
                    className={`mb-1 flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? "bg-[#C8102E] font-semibold text-white"
                        : "text-[#8C8785]"
                    }`}
                  >
                    {cell.day}
                  </div>
                  <div className="flex flex-col gap-1">
                    {dayEvents.slice(0, 2).map((event) => {
                      const org = orgById.get(event.orgId);
                      return (
                        <div
                          key={event.id}
                          title={event.title}
                          className="truncate rounded px-1 py-0.5 text-[10px] font-medium text-[#F2F0EE]"
                          style={{
                            backgroundColor: `${org?.color ?? "#C8102E"}33`,
                          }}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-[#8C8785]">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
