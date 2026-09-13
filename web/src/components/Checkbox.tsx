"use client";

import * as RadixCheckbox from "@radix-ui/react-checkbox";

type CheckboxProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
};

export function Checkbox({ label, checked, disabled, onChange }: CheckboxProps) {
  return (
    <label
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed border-slate-500/10 opacity-40"
          : "cursor-pointer border-slate-500/15 hover:border-slate-500/40"
      } ${checked ? "border-slate-500 bg-slate-500/5" : ""}`}
    >
      <RadixCheckbox.Root
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-500/40 outline-none data-[state=checked]:border-slate-500 data-[state=checked]:bg-slate-500"
      >
        <RadixCheckbox.Indicator>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-3 w-3 text-orange-50"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <span className="text-slate-500">{label}</span>
    </label>
  );
}
