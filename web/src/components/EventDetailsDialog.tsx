"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Clock, MapPin, X } from "lucide-react";

export type EventDetails = {
  id: string;
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
  onRemove,
}: {
  event: EventDetails | null;
  onClose: () => void;
  onRemove?: (eventId: string) => void;
}) {
  return (
    <Dialog.Root
      open={event !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-40 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#2E2E2E] bg-[#242424] px-8 py-7 text-center shadow-lg outline-none">
          <Dialog.Close
            aria-label="Close"
            className="absolute top-3 right-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-[#8C8785] transition-colors hover:text-[#DC143C]"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </Dialog.Close>

          {event && (
            <>
              <div className="mb-3 flex items-center justify-center gap-1.5 text-sm font-medium text-white">
                <span
                  className="h-2.5 w-2.5 shrink-0"
                  style={{ backgroundColor: event.orgColor ?? "#DC143C" }}
                />
                {event.orgName}
              </div>
              <Dialog.Title className="font-heading text-xl font-semibold text-white underline decoration-[#DC143C] decoration-2 underline-offset-4">
                {event.title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-[#8C8785]">
                {formatFullDate(event.startDate)}
              </Dialog.Description>

              <div className="mt-5 flex flex-col gap-2 text-left text-sm text-white">
                {event.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-[#DC143C]" />
                    {event.time}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-[#DC143C]" />
                  {event.location}
                </div>
              </div>

              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(event.id)}
                  className="mt-6 w-full cursor-pointer rounded-full border border-[#2E2E2E] py-2.5 text-sm font-semibold text-[#8C8785] transition-colors hover:border-[#DC143C] hover:text-[#DC143C]"
                >
                  Remove from saved
                </button>
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
