"use server";

import {
  BackendError,
  deleteSavedEvent,
  postMatches,
  putProfile,
  putSavedEvent,
} from "@/lib/account";
import type { Matches, StudentProfile } from "@/lib/api";

// Server Actions the onboarding and dashboard pages call. Each one reads the
// Auth0 session itself (inside lib/account.ts), since these can be invoked
// directly with a POST request, not just from our UI.

export async function saveProfile(profile: StudentProfile) {
  await putProfile({
    major: String(profile.major),
    interests: Array.from(profile.interests ?? [], String),
    hobbies: Array.from(profile.hobbies ?? [], String),
    class_year: profile.class_year ? String(profile.class_year) : null,
    ethnicity: profile.ethnicity ? String(profile.ethnicity) : null,
  });
}

// Null when the student hasn't saved their answers yet.
export async function loadMatches(): Promise<Matches | null> {
  try {
    return await postMatches();
  } catch (error) {
    if (error instanceof BackendError && error.status === 409) return null;
    throw error;
  }
}

export async function saveEvent(eventId: string) {
  await putSavedEvent(String(eventId));
}

export async function unsaveEvent(eventId: string) {
  await deleteSavedEvent(String(eventId));
}
