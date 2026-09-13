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
  for (const event of [...matches.flatMap((match) => match.events), ...dashboard.saved_events]) {
    events.set(event.id, {
      id: event.id,
      title: event.title,
      date: event.start_date,
      color: colors.get(event.org_id) ?? OTHER_ORG_COLOR,
    });
  }

  return <CalendarView events={[...events.values()]} orgs={orgs} />;
}
