export type MatchedOrg = {
  id: string;
  name: string;
  color: string;
};

export type RecommendedEvent = {
  id: string;
  orgId: string;
  org: string;
  orgColor: string;
  title: string;
  date: string; // yyyy-mm-dd, always within the current month
  time: string;
  location: string;
  blurb: string;
};

export const MATCHED_ORGS: MatchedOrg[] = [
  { id: "acm", name: "ACM", color: "#C8102E" },
  { id: "hosa", name: "HOSA", color: "#3B82F6" },
  { id: "esports", name: "Esports Club", color: "#22C55E" },
];

// Spreads sample events across the CURRENT month (clamped to its length) so
// the calendar view always has something to show, regardless of when this
// is run.
function dateInCurrentMonth(dayOffset: number): string {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const day = Math.min(1 + dayOffset, daysInMonth);
  const d = new Date(now.getFullYear(), now.getMonth(), day);
  return d.toISOString().slice(0, 10);
}

export const RECOMMENDED_EVENTS: RecommendedEvent[] = [
  {
    id: "r1",
    orgId: "acm",
    org: "ACM",
    orgColor: "#C8102E",
    title: "Hackathon Info Session",
    date: dateInCurrentMonth(2),
    time: "6:00 PM",
    location: "ECE Rm 101",
    blurb: "Learn what to expect at this semester's 24-hour hackathon and how to form a team.",
  },
  {
    id: "r2",
    orgId: "hosa",
    org: "HOSA",
    orgColor: "#3B82F6",
    title: "Pre-Med Panel",
    date: dateInCurrentMonth(5),
    time: "5:00 PM",
    location: "HHS Bldg 220",
    blurb: "A guest panel of med students answering questions about applications and MCAT prep.",
  },
  {
    id: "r3",
    orgId: "esports",
    org: "Esports Club",
    orgColor: "#22C55E",
    title: "Valorant Scrim Night",
    date: dateInCurrentMonth(8),
    time: "7:00 PM",
    location: "Gaming Lounge",
    blurb: "Casual scrims open to all skill levels, controllers and headsets provided.",
  },
  {
    id: "r4",
    orgId: "acm",
    org: "ACM",
    orgColor: "#C8102E",
    title: "Resume Workshop",
    date: dateInCurrentMonth(11),
    time: "4:00 PM",
    location: "Career Center",
    blurb: "Bring your resume for a live review from tech recruiters.",
  },
  {
    id: "r5",
    orgId: "hosa",
    org: "HOSA",
    orgColor: "#3B82F6",
    title: "Blood Drive",
    date: dateInCurrentMonth(14),
    time: "10:00 AM",
    location: "Student Union",
    blurb: "",
  },
  {
    id: "r6",
    orgId: "esports",
    org: "Esports Club",
    orgColor: "#22C55E",
    title: "Smash Tournament",
    date: dateInCurrentMonth(18),
    time: "6:30 PM",
    location: "Gaming Lounge",
    blurb: "",
  },
  {
    id: "r7",
    orgId: "acm",
    org: "ACM",
    orgColor: "#C8102E",
    title: "Networking Night",
    date: dateInCurrentMonth(22),
    time: "6:00 PM",
    location: "Business Building",
    blurb: "",
  },
];
