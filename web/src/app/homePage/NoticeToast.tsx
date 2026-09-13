"use client";

import * as Toast from "@radix-ui/react-toast";
import { CheckCircle2, EyeOff, XCircle } from "lucide-react";

export type Notice = {
  tone: "success" | "error" | "hidden";
  title: string;
  description: string;
  // An optional button, e.g. "Undo".
  action?: { label: string; onClick: () => void };
};

const ICONS = { success: CheckCircle2, error: XCircle, hidden: EyeOff };

export function NoticeToast({
  notice,
  open,
  onOpenChange,
}: {
  notice: Notice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const Icon = ICONS[notice?.tone ?? "success"];

  return (
    // Longer when there's an action, so there's time to press it.
    <Toast.Provider duration={notice?.action ? 5000 : 2200} swipeDirection="right">
      <Toast.Root
        open={open && notice !== null}
        onOpenChange={onOpenChange}
        className="flex translate-y-2 items-center gap-3 rounded-full border border-[#2E2E2E] bg-[#1A1A1A] px-6 py-3 opacity-0 shadow-lg transition-all duration-300 data-[state=open]:translate-y-0 data-[state=open]:opacity-100"
      >
        <Icon className="h-5 w-5 shrink-0 text-[#C8102E]" />
        <div>
          <Toast.Title className="text-sm font-semibold text-[#F2F0EE]">
            {notice?.title}
          </Toast.Title>
          <Toast.Description className="text-xs text-[#8C8785]">
            {notice?.description}
          </Toast.Description>
        </div>
        {notice?.action && (
          <Toast.Action
            altText={notice.action.label}
            onClick={notice.action.onClick}
            className="ml-2 cursor-pointer rounded-full border border-[#2E2E2E] px-3 py-1 text-xs font-semibold text-[#F2F0EE] transition-colors hover:border-[#C8102E]"
          >
            {notice.action.label}
          </Toast.Action>
        )}
      </Toast.Root>
      <Toast.Viewport className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 outline-none" />
    </Toast.Provider>
  );
}
