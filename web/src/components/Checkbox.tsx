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
      className={`font-heading flex items-center gap-2 rounded-full border border-[#F3A5A5]/25 px-4 py-2 text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-pointer hover:border-[#F3A5A5]"
      } ${checked ? "bg-[#DC143C]/10" : ""}`}
    >
      <RadixCheckbox.Root
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[#F3A5A5]/50 outline-none data-[state=checked]:border-[#DC143C] data-[state=checked]:bg-[#DC143C]"
      >
        <RadixCheckbox.Indicator>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-3 w-3 text-white"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <span className="text-[#F3A5A5]">{label}</span>
    </label>
  );
}
