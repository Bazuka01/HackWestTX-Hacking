import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import type { Dashboard, Matches, StudentProfile } from "@/lib/api";

// Server-side access to the signed-in student's account. The FastAPI backend
// trusts calls carrying INTERNAL_API_KEY, so this module must never be
// imported by a Client Component.

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export type AccountUser = {
  id: string;
  email: string | null;
  name: string | null;
  firstName: string;
};

export class BackendError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

// The signed-in student, or null. Cached so every call during one request
// shares a single session read.
export const getSessionUser = cache(async (): Promise<AccountUser | null> => {
  // Without Auth0 credentials there are no accounts (see proxy.ts).
  if (!process.env.AUTH0_DOMAIN) return null;

  const session = await auth0.getSession();
  if (!session) return null;

  const { sub, email, name, given_name, nickname } = session.user;
  return {
    id: sub,
    email: email ?? null,
    name: name ?? null,
    firstName: given_name ?? nickname ?? name ?? "there",
  };
});

// Send signed-out visitors to the sign-in page.
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/");
  return user;
}

async function callBackend<T>(
  path: string,
  { method = "GET", body }: { method?: string; body?: unknown } = {}
): Promise<T> {
  const user = await requireUser();
  const internalApiKey = process.env.INTERNAL_API_KEY;
  if (!internalApiKey) {
    throw new Error("INTERNAL_API_KEY is missing from web/.env.local.");
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Api-Key": internalApiKey,
      // URL-encoded because HTTP headers can't hold characters like "é".
      "X-User-Id": encodeURIComponent(user.id),
      ...(user.email && { "X-User-Email": encodeURIComponent(user.email) }),
      ...(user.name && { "X-User-Name": encodeURIComponent(user.name) }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BackendError(
      `Backend ${method} ${path} failed (${response.status})`,
      response.status
    );
  }

  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}

export function getDashboard() {
  return callBackend<Dashboard>("/users/me/dashboard");
}

export async function getProfile() {
  const data = await callBackend<{ profile: StudentProfile | null }>(
    "/users/me/profile"
  );
  return data.profile;
}

export function putProfile(profile: StudentProfile) {
  return callBackend<{ profile: StudentProfile }>("/users/me/profile", {
    method: "PUT",
    body: profile,
  });
}

// Returns the saved matches, or asks Gemini for new ones if there are none.
export function postMatches() {
  return callBackend<Matches>("/users/me/matches", { method: "POST" });
}

export function putSavedEvent(eventId: string) {
  return callBackend<void>(
    `/users/me/saved-events/${encodeURIComponent(eventId)}`,
    { method: "PUT" }
  );
}

export function deleteSavedEvent(eventId: string) {
  return callBackend<void>(
    `/users/me/saved-events/${encodeURIComponent(eventId)}`,
    { method: "DELETE" }
  );
}
