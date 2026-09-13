import { getDashboard } from "@/lib/account";
import { matchColors, OTHER_ORG_COLOR } from "@/lib/matchColors";
import type { OrgEvent, SavedEvent } from "@/lib/api";
import { CalendarView, type CalendarEvent, type CalendarOrg } from "./CalendarView";

function getOrgName(event: OrgEvent | SavedEvent, orgNameById: Map<string, string>) {
  return "org_name" in event ? event.org_name : (orgNameById.get(event.org_id) ?? "");
}

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

  const orgNameById = new Map(matches.map((match) => [match.org_id, match.organization.name]));

  // Matched organizations' upcoming events plus anything saved, without repeats.
  const events = new Map<string, CalendarEvent>();
  for (const event of [...matches.flatMap((match) => match.events), ...dashboard.saved_events]) {
    events.set(event.id, {
      id: event.id,
      title: event.title,
      date: event.start_date,
      time: event.start_time,
      location: event.location ?? "Location TBA",
      orgName: getOrgName(event, orgNameById),
      color: colors.get(event.org_id) ?? OTHER_ORG_COLOR,
    });
  }

  return <CalendarView events={[...events.values()]} orgs={orgs} />;
}
