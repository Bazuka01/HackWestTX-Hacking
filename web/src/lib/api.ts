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

// An organization Gemini picked for the student, with its upcoming events.
export type Match = {
  org_id: string;
  reason: string;
  organization: Organization;
  events: OrgEvent[];
};

export type Matches = {
  recommendations: Match[];
  suggestions: Match[];
};

export type SavedEvent = OrgEvent & { org_name: string };

// GET /users/me/dashboard
export type Dashboard = Matches & {
  profile: StudentProfile | null;
  saved_events: SavedEvent[];
};

// "2026-09-13" -> "Sep 13". Built from the date parts so the day never
// shifts with the viewer's time zone.
export function formatEventDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function instagramUrl(username: string) {
  return `https://www.instagram.com/${encodeURIComponent(username)}/`;
}
