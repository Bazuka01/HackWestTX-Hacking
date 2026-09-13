import type { Matches } from "@/lib/api";

// Each home page organization gets a color that follows it across the home
// page and calendar: warm-to-cool for the top 3, a second set for
// suggestions, and a third for organizations added from Browse.
const RECOMMENDATION_COLORS = ["#DC143C", "#3B82F6", "#22C55E"];
const SUGGESTION_COLORS = ["#F59E0B", "#A855F7", "#14B8A6"];
const ADDED_COLORS = ["#EC4899", "#84CC16", "#06B6D4"];

// For saved events from organizations that are no longer matches.
export const OTHER_ORG_COLOR = "#8C8785";

export function matchColors({ recommendations, suggestions, added }: Matches) {
  const colors = new Map<string, string>();
  const assign = (matches: Matches["added"], palette: string[]) =>
    matches.forEach((match, i) => colors.set(match.org_id, palette[i % palette.length]));

  assign(recommendations, RECOMMENDATION_COLORS);
  assign(suggestions, SUGGESTION_COLORS);
  assign(added, ADDED_COLORS);
  return colors;
}
