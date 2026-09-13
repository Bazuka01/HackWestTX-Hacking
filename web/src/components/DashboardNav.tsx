"use client";

import Link from "next/link";
import Image from "next/image";
import { Bookmark, CalendarDays, LogOut } from "lucide-react";
import connectXLogo from "@/components/icons/connectx-logo.png";

type ActiveTab = "home" | "saved" | "calendar";

function tabClass(isActive: boolean) {
  return `flex items-center rounded px-2.5 py-2 text-sm font-semibold transition-colors sm:px-3.5 ${
    isActive ? "text-[#DC143C]" : "text-[#8C8785] hover:text-[#DC143C]"
  }`;
}

// Phones show icons instead of labels so the nav fits next to the fixed
// language switcher in the top-right corner.
export function DashboardNav({ active }: { active: ActiveTab }) {
  return (
    <nav className="fixed inset-x-0 top-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-[#2E2E2E] bg-[#242424] py-4 pr-36 pl-5 sm:grid-cols-3 sm:px-7">
      <Link
        href="/homePage"
        className="font-heading flex items-center gap-2 text-xl font-bold tracking-tight text-white"
      >
        <Image src={connectXLogo} alt="" aria-hidden className="h-10 w-10 object-contain" />
        <span>
          Connect<span className="text-[#DC143C]">X</span>
        </span>
      </Link>
      <div className="flex justify-center gap-1.5">
        <Link
          href="/savedEvents"
          aria-label="Saved Events"
          className={tabClass(active === "saved")}
        >
          <Bookmark className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Saved Events</span>
        </Link>
        <Link
          href="/calendar"
          aria-label="Calendar"
          className={tabClass(active === "calendar")}
        >
          <CalendarDays className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Calendar</span>
        </Link>
      </div>
      {/* sm:mr-28 leaves room for the language switcher on wider screens. */}
      <div className="flex justify-end sm:mr-28">
        {/* A plain <a>: Auth0's logout route redirects, which needs a full page load. */}
        <a href="/auth/logout" aria-label="Sign out" className={tabClass(false)}>
          <LogOut className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Sign out</span>
        </a>
      </div>
    </nav>
  );
}
