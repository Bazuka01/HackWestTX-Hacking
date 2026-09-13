"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type DropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  searchable?: boolean;
  allowCustom?: boolean;
};

export function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  allowCustom = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customValue, setCustomValue] = useState("");

  const filtered = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, search, searchable]);

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
          className="flex w-full cursor-pointer items-center justify-between rounded-full border border-[#F3A5A5]/40 bg-black/20 px-6 py-3 text-left text-[#F3A5A5] outline-none transition-colors hover:border-[#F3A5A5]"
        >
          <span className={value ? "text-[#F3A5A5]" : "text-[#F3A5A5]/50"}>
            {value || placeholder}
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
          className="z-50 max-h-80 overflow-hidden rounded-2xl border border-[#F3A5A5]/20 bg-[#242424] shadow-lg"
        >
          {searchable && (
            <div className="border-b border-[#F3A5A5]/15 p-2">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Search..."
                className="w-full rounded-lg border border-[#F3A5A5]/30 px-3 py-2 text-sm text-[#F3A5A5] placeholder:text-[#F3A5A5]/50 outline-none focus:border-[#F3A5A5]"
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-2 text-sm text-[#F3A5A5]/50">
                No matches
              </div>
            ) : (
              filtered.map((opt) => (
                <DropdownMenu.Item
                  key={opt}
                  onSelect={() => select(opt)}
                  className="cursor-pointer px-4 py-2 text-sm text-[#F3A5A5] outline-none data-[highlighted]:bg-[#DC143C]/15"
                >
                  {opt}
                </DropdownMenu.Item>
              ))
            )}
          </div>

          {allowCustom && (
            <div className="border-t border-[#F3A5A5]/15 p-2">
              <input
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={handleCustomKeyDown}
                placeholder="Not listed? Type yours and press Enter"
                className="w-full rounded-lg border border-[#F3A5A5]/30 px-3 py-2 text-sm text-[#F3A5A5] placeholder:text-[#F3A5A5]/50 outline-none focus:border-[#F3A5A5]"
              />
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
