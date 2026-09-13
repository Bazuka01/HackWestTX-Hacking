// Shapes of the data returned by the FastAPI backend in /backend.

// Matches StudentProfile in backend/models.py.
export type StudentProfile = {
  major: string;
  interests: string[];
  hobbies: string[];
  class_year: string | null;
  ethnicity: string | null;
};

// Matches the orgs table as returned by backend/database.py.
export type Organization = {
  id: string;
  name: string;
  category: string | null;
  interestTags: string[];
  hobbyTags: string[];
  cultureTag: string | null;
  contact: string | null;
  meetingTime: string | null;
  instagramUsername: string | null;
};

// Matches the events table, which uses the same fields as backend/events.json.
export type OrgEvent = {
  id: string;
  org_id: string;
  title: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  timezone: string;
  location: string | null;
  status: string;
  details_complete: boolean;
  source_username: string | null;
  source_url: string | null;
  source_posted_at: string | null;
};

// An organization on the student's home page, with its upcoming events.
export type Match = {
  org_id: string;
  // Gemini's explanation; null for organizations added from Browse.
  reason: string | null;
  // Kept organizations stay when the student gets new picks.
  kept: boolean;
  organization: Organization;
  events: OrgEvent[];
};

export type Matches = {
  recommendations: Match[];
  suggestions: Match[];
  // Organizations the student added from Browse (always kept).
  added: Match[];
};

export type SavedEvent = OrgEvent & { org_name: string };

// GET /users/me/dashboard
export type Dashboard = Matches & {
  profile: StudentProfile | null;
  saved_events: SavedEvent[];
};

export type OrganizationWithEvents = Organization & { events: OrgEvent[] };

// GET /users/me/orgs
export type BrowseData = {
  orgs: OrganizationWithEvents[];
  matched_org_ids: string[];
  // On the home page for good: kept matches and added organizations.
  kept_org_ids: string[];
  hidden_org_ids: string[];
  saved_event_ids: string[];
};

// "2026-09-13" -> "Sep 13" (or "13 sept" in French). Built from the date
// parts so the day never shifts with the viewer's time zone.
export function formatEventDate(
  isoDate: string,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, options);
}

export function instagramUrl(username: string) {
  return `https://www.instagram.com/${encodeURIComponent(username)}/`;
}
