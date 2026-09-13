"use client";

import Link from "next/link";
import Image from "next/image";
import { Bookmark, CalendarDays, LogOut, Search } from "lucide-react";
import { useT } from "@/components/LanguageProvider";
import connectXLogo from "@/components/icons/connectx-logo.png";

type ActiveTab = "home" | "browse" | "saved" | "calendar";

function tabClass(isActive: boolean) {
  return `flex items-center rounded px-2 py-2 text-sm font-semibold transition-colors sm:px-3.5 ${
    isActive ? "text-[#DC143C]" : "text-[#8C8785] hover:text-[#DC143C]"
  }`;
}

// Phones show icons instead of labels so the nav fits next to the fixed
// language switcher in the top-right corner.
export function DashboardNav({ active }: { active: ActiveTab }) {
  const t = useT();
  const tabs = [
    { id: "browse", href: "/browse", label: t.nav.browse, Icon: Search },
    { id: "saved", href: "/savedEvents", label: t.nav.saved, Icon: Bookmark },
    { id: "calendar", href: "/calendar", label: t.nav.calendar, Icon: CalendarDays },
  ] as const;

  return (
    <nav className="fixed inset-x-0 top-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-[#2E2E2E] bg-[#242424] py-4 pr-20 pl-5 sm:grid-cols-3 sm:px-7">
      <Link
        href="/homePage"
        className="font-heading flex items-center gap-2 text-xl font-bold tracking-tight text-white"
      >
        <Image src={connectXLogo} alt="" aria-hidden className="h-10 w-10 object-contain" />
        <span className="hidden sm:inline">
          Connect<span className="text-[#DC143C]">X</span>
        </span>
      </Link>
      <div className="flex justify-center gap-1">
        {tabs.map(({ id, href, label, Icon }) => (
          <Link
            key={id}
            href={href}
            aria-label={label}
            className={tabClass(active === id)}
          >
            <Icon className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
      </div>
      {/* sm:mr-36 leaves room for the language switcher on wider screens. */}
      <div className="flex justify-end sm:mr-36">
        {/* A plain <a>: Auth0's logout route redirects, which needs a full page load. */}
        <a href="/auth/logout" aria-label={t.nav.signOut} className={tabClass(false)}>
          <LogOut className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">{t.nav.signOut}</span>
        </a>
      </div>
    </nav>
  );
}
