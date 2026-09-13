"use client";

import Link from "next/link";

type ActiveTab = "home" | "saved" | "calendar";

export function DashboardNav({ active }: { active: ActiveTab }) {
  return (
    <nav className="fixed inset-x-0 top-0 z-30 grid grid-cols-3 items-center border-b border-[#2E2E2E] bg-[#1A1A1A] px-7 py-4">
      <Link
        href="/homePage"
        className="text-xl font-bold tracking-tight text-[#F2F0EE]"
      >
        ConnectX
      </Link>
      <div className="flex justify-center gap-1.5">
        <Link
          href="/savedEvents"
          className={`rounded px-3.5 py-2 text-sm font-semibold transition-colors ${
            active === "saved" ? "text-[#C8102E]" : "text-[#8C8785] hover:text-[#C8102E]"
          }`}
        >
          Saved Events
        </Link>
        <Link
          href="/calendar"
          className={`rounded px-3.5 py-2 text-sm font-semibold transition-colors ${
            active === "calendar" ? "text-[#C8102E]" : "text-[#8C8785] hover:text-[#C8102E]"
          }`}
        >
          Calendar
        </Link>
      </div>
      <div />
    </nav>
  );
}
