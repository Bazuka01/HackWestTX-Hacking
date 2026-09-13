"use server";

import { refresh } from "next/cache";
import {
  BackendError,
  deleteHiddenOrg,
  deleteKeptOrg,
  deleteSavedEvent,
  postMatches,
  putHiddenOrg,
  putKeptOrg,
  putProfile,
  putSavedEvent,
} from "@/lib/account";
import type { Matches, StudentProfile } from "@/lib/api";
import { getLanguage } from "@/lib/serverLanguage";

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

// Null when the student hasn't saved their answers yet. Gemini writes the
// reasons in the language the student picked.
export async function loadMatches(): Promise<Matches | null> {
  try {
    return await postMatches({ language: await getLanguage() });
  } catch (error) {
    if (error instanceof BackendError && error.status === 409) return null;
    throw error;
  }
}

// Ask Gemini for different organizations without changing the answers, then
// refresh the page that asked so it shows them.
export async function getNewPicks() {
  await postMatches({ refresh: true, language: await getLanguage() });
  refresh();
}

export async function saveEvent(eventId: string) {
  await putSavedEvent(String(eventId));
}

export async function unsaveEvent(eventId: string) {
  await deleteSavedEvent(String(eventId));
}

// "Not interested"
export async function hideOrg(orgId: string) {
  await putHiddenOrg(String(orgId));
}

export async function unhideOrg(orgId: string) {
  await deleteHiddenOrg(String(orgId));
}

// "Keep" on the home page, or "Add" from Browse.
export async function keepOrg(orgId: string) {
  await putKeptOrg(String(orgId));
}

export async function unkeepOrg(orgId: string) {
  await deleteKeptOrg(String(orgId));
}
