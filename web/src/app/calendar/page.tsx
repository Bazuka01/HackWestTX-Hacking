import { calendarEntry } from "@/lib/calendarLinks";
import { getDashboard } from "@/lib/account";
import { matchColors, OTHER_ORG_COLOR } from "@/lib/matchColors";
import { CalendarView, type CalendarEvent, type CalendarOrg } from "./CalendarView";

export default async function CalendarPage() {
  // Signed-out visitors are sent to sign in.
  const dashboard = await getDashboard();
  const colors = matchColors(dashboard);
  const matches = [...dashboard.recommendations, ...dashboard.suggestions];

  const orgs: CalendarOrg[] = matches.map((match) => ({
    id: match.org_id,
    name: match.organization.name,
    color: colors.get(match.org_id) ?? OTHER_ORG_COLOR,
  }));

  // Matched organizations' upcoming events plus anything saved, without repeats.
  const events = new Map<string, CalendarEvent>();
  for (const match of matches) {
    for (const event of match.events) {
      events.set(event.id, {
        ...calendarEntry(event, match.organization.name),
        color: colors.get(match.org_id) ?? OTHER_ORG_COLOR,
      });
    }
  }
  for (const event of dashboard.saved_events) {
    if (events.has(event.id)) continue;
    events.set(event.id, {
      ...calendarEntry(event, event.org_name),
      color: colors.get(event.org_id) ?? OTHER_ORG_COLOR,
    });
  }

  return <CalendarView events={[...events.values()]} orgs={orgs} />;
}
