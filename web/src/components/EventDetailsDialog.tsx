"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Clock, MapPin, X } from "lucide-react";

export type EventDetails = {
  title: string;
  orgName: string;
  orgColor?: string;
  startDate: string; // yyyy-mm-dd
  time: string | null;
  location: string;
};

function formatFullDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function EventDetailsDialog({
  event,
  onClose,
}: {
  event: EventDetails | null;
  onClose: () => void;
}) {
  return (
    <Dialog.Root
      open={event !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-40 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#2E2E2E] bg-[#1A1A1A] px-8 py-7 text-center shadow-lg outline-none">
          <Dialog.Close
            aria-label="Close"
            className="absolute top-3 right-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-[#8C8785] transition-colors hover:text-[#C8102E]"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </Dialog.Close>

          {event && (
            <>
              <div className="mb-3 flex items-center justify-center gap-1.5 text-sm font-medium text-[#F2F0EE]">
                <span
                  className="h-2.5 w-2.5 shrink-0"
                  style={{ backgroundColor: event.orgColor ?? "#C8102E" }}
                />
                {event.orgName}
              </div>
              <Dialog.Title className="text-xl font-semibold text-[#F2F0EE]">
                {event.title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-[#8C8785]">
                {formatFullDate(event.startDate)}
              </Dialog.Description>

              <div className="mt-5 flex flex-col gap-2 text-left text-sm text-[#F2F0EE]">
                {event.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-[#C8102E]" />
                    {event.time}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-[#C8102E]" />
                  {event.location}
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
