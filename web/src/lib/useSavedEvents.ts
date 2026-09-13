"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getSavedEvents,
  saveEvent,
  removeSavedEvent,
  subscribeSavedEvents,
  type SavedEvent,
} from "@/lib/savedEventsStore";

export function useSavedEvents() {
  const [events, setEvents] = useState<SavedEvent[]>([]);

  useEffect(() => {
    // Read localStorage only after mount (not via a lazy useState initializer)
    // so the server-rendered "[]" and the client's first render still match,
    // avoiding a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEvents(getSavedEvents());
    return subscribeSavedEvents(() => setEvents(getSavedEvents()));
  }, []);

  const save = useCallback((event: SavedEvent) => saveEvent(event), []);
  const remove = useCallback((id: string) => removeSavedEvent(id), []);

  return { events, save, remove };
}
