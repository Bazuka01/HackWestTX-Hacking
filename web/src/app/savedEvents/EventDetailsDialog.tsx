"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Clock, MapPin } from "lucide-react";
import type { SavedEvent } from "@/lib/savedEventsStore";

function formatEventDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function EventDetailsDialog({
  event,
  onClose,
}: {
  event: SavedEvent | null;
  onClose: () => void;
}) {
  return (
    <Dialog.Root open={event !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-40 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#2E2E2E] bg-[#1A1A1A] px-8 py-7 text-center shadow-lg outline-none">
          {event && (
            <>
              <div
                className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-[#F2F0EE]"
                style={{ backgroundColor: "#C8102E33" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#C8102E]" />
                {event.org}
              </div>
              <Dialog.Title className="text-xl font-semibold text-[#F2F0EE]">
                {event.title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-[#8C8785]">
                {formatEventDate(event.date)}
              </Dialog.Description>

              <div className="mt-5 flex flex-col gap-2 text-left text-sm text-[#F2F0EE]">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-[#C8102E]" />
                  {event.time}
                </div>
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
