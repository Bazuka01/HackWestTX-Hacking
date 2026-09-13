export type SavedEvent = {
  id: string;
  orgId: string;
  org: string;
  title: string;
  date: string;
  time: string;
  location: string;
};

const STORAGE_KEY = "connectx.savedEvents";
const CHANGE_EVENT = "connectx-saved-events-changed";

export function getSavedEvents(): SavedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedEvent[]) : [];
  } catch {
    return [];
  }
}

function persist(events: SavedEvent[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveEvent(event: SavedEvent): void {
  const current = getSavedEvents();
  if (current.some((e) => e.id === event.id)) return;
  persist([...current, event]);
}

export function removeSavedEvent(id: string): void {
  persist(getSavedEvents().filter((e) => e.id !== id));
}

export function subscribeSavedEvents(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
