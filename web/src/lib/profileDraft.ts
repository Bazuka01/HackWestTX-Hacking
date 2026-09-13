import type { StudentProfile } from "@/lib/api";

// Step 1 (majClass) keeps its answers here until step 2 (interestChecklist)
// saves the whole profile to the student's account.
const DRAFT_KEY = "connectx:profile-draft";

export type ProfileDraft = Pick<
  StudentProfile,
  "major" | "class_year" | "ethnicity"
>;

export function saveProfileDraft(draft: ProfileDraft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage can be blocked; step 2 falls back to the saved profile.
  }
}

export function loadProfileDraft(): ProfileDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as ProfileDraft) : null;
  } catch {
    return null;
  }
}

export function clearProfileDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to clear.
  }
}
