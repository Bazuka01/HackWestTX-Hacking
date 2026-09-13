"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useT } from "@/components/LanguageProvider";
import { foldForSearch } from "@/lib/i18n";

type DropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  // Translated text to show for a value; the value itself is what's saved.
  getLabel?: (value: string) => string;
  searchable?: boolean;
  allowCustom?: boolean;
};

export function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  getLabel = (option) => option,
  searchable = false,
  allowCustom = false,
}: DropdownProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customValue, setCustomValue] = useState("");

  const filtered = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const q = foldForSearch(search.trim());
    return options.filter((o) => foldForSearch(getLabel(o)).includes(q));
  }, [options, search, searchable, getLabel]);

  function select(v: string) {
    onChange(v);
    setOpen(false);
    setSearch("");
  }

  function handleCustomKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    e.stopPropagation();
    if (e.key === "Enter" && customValue.trim()) {
      select(customValue.trim());
      setCustomValue("");
    }
  }

  return (
    <DropdownMenu.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between rounded-full border border-slate-500/15 bg-orange-200 px-6 py-3 text-left text-slate-500 outline-none transition-colors hover:border-slate-500/40"
        >
          <span className={value ? "text-slate-500" : "text-slate-500/40"}>
            {value ? getLabel(value) : placeholder}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className={`h-4 w-4 shrink-0 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
          className="z-50 max-h-80 overflow-hidden rounded-2xl border border-slate-500/10 bg-orange-200 shadow-lg"
        >
          {searchable && (
            <div className="border-b border-slate-500/10 p-2">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder={t.dropdown.search}
                className="w-full rounded-lg border border-slate-500/30 px-3 py-2 text-sm text-slate-600/85 placeholder:text-slate-500/60 outline-none focus:border-slate-600"
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-2 text-sm text-slate-500/40">
                {t.dropdown.noMatches}
              </div>
            ) : (
              filtered.map((opt) => (
                <DropdownMenu.Item
                  key={opt}
                  onSelect={() => select(opt)}
                  className="cursor-pointer px-4 py-2 text-sm text-slate-500 outline-none data-[highlighted]:bg-slate-500/5"
                >
                  {getLabel(opt)}
                </DropdownMenu.Item>
              ))
            )}
          </div>

          {allowCustom && (
            <div className="border-t border-slate-500/10 p-2">
              <input
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={handleCustomKeyDown}
                placeholder={t.dropdown.customPlaceholder}
                className="w-full rounded-lg border border-slate-500/30 px-3 py-2 text-sm text-slate-600/85 placeholder:text-slate-500/60 outline-none focus:border-slate-600"
              />
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
