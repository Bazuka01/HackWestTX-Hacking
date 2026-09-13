import { useMemo, useSyncExternalStore } from "react";
import {
  fetchRecommendations,
  type Recommendation,
  type StudentProfile,
} from "@/lib/api";

// The onboarding answers and the latest recommendations are kept in
// sessionStorage, so they survive navigation and refreshes but reset when
// the tab is closed.
const PROFILE_KEY = "connectx:profile";
const RECOMMENDATIONS_KEY = "connectx:recommendations";

type StoredRecommendations = {
  profileKey: string;
  recommendations: Recommendation[];
};

function readItem(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function readJson<T>(key: string): T | null {
  const raw = readItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (e.g. blocked cookies); the flow still works
    // within the current page, it just won't be remembered.
  }
}

// Each onboarding step saves its own answers on top of the earlier ones.
export function saveProfileAnswers(answers: Partial<StudentProfile>) {
  const saved = readJson<Partial<StudentProfile>>(PROFILE_KEY);
  writeJson(PROFILE_KEY, { ...saved, ...answers });
}

// The complete profile, or null if the student hasn't finished both steps.
export function loadProfile(): StudentProfile | null {
  const answers = readJson<Partial<StudentProfile>>(PROFILE_KEY);
  if (!answers?.major || !answers.hobbies?.length) return null;

  return {
    major: answers.major,
    interests: answers.interests ?? [],
    hobbies: answers.hobbies,
    class_year: answers.class_year ?? null,
    ethnicity: answers.ethnicity ?? null,
  };
}

const pendingRequests = new Map<string, Promise<Recommendation[]>>();

// Every request is a Gemini call, so reuse the saved recommendations while
// the answers are unchanged, and share one in-flight request between callers
// (React runs effects twice in development).
export function getRecommendations(
  profile: StudentProfile
): Promise<Recommendation[]> {
  const profileKey = JSON.stringify(profile);

  const stored = readJson<StoredRecommendations>(RECOMMENDATIONS_KEY);
  if (stored?.profileKey === profileKey) {
    return Promise.resolve(stored.recommendations);
  }

  let request = pendingRequests.get(profileKey);
  if (!request) {
    request = fetchRecommendations(profile)
      .then((recommendations) => {
        writeJson(RECOMMENDATIONS_KEY, { profileKey, recommendations });
        return recommendations;
      })
      .finally(() => pendingRequests.delete(profileKey));
    pendingRequests.set(profileKey, request);
  }
  return request;
}

// sessionStorage has no change events for the page that writes to it,
// so there is nothing to subscribe to.
function subscribe() {
  return () => {};
}

// The most recent recommendations: undefined until the page is running in
// the browser, then null if the student hasn't received any yet.
export function useSavedRecommendations(): Recommendation[] | null | undefined {
  const raw = useSyncExternalStore(
    subscribe,
    () => readItem(RECOMMENDATIONS_KEY),
    () => undefined
  );

  return useMemo(() => {
    if (raw === undefined) return undefined;
    if (raw === null) return null;
    try {
      return (JSON.parse(raw) as StoredRecommendations).recommendations;
    } catch {
      return null;
    }
  }, [raw]);
}
