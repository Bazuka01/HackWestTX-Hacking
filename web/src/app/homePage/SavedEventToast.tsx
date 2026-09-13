"use client";

import * as Toast from "@radix-ui/react-toast";
import { CheckCircle2, XCircle } from "lucide-react";

export function SavedEventToast({
  open,
  failed = false,
  onOpenChange,
}: {
  open: boolean;
  failed?: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const Icon = failed ? XCircle : CheckCircle2;

  return (
    <Toast.Provider duration={2200} swipeDirection="right">
      <Toast.Root
        open={open}
        onOpenChange={onOpenChange}
        className="flex translate-y-2 items-center gap-3 rounded-full border border-[#2E2E2E] bg-[#1A1A1A] px-6 py-3 opacity-0 shadow-lg transition-all duration-300 data-[state=open]:translate-y-0 data-[state=open]:opacity-100"
      >
        <Icon className="h-5 w-5 shrink-0 text-[#C8102E]" />
        <div>
          <Toast.Title className="text-sm font-semibold text-[#F2F0EE]">
            {failed ? "Couldn't save event" : "Event Saved!"}
          </Toast.Title>
          <Toast.Description className="text-xs text-[#8C8785]">
            {failed
              ? "Please try again."
              : "Find it on your Saved Events page."}
          </Toast.Description>
        </div>
      </Toast.Root>
      <Toast.Viewport className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 outline-none" />
    </Toast.Provider>
  );
}
